// src/services/apiService.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// 백엔드 API URL
const API_BASE_URL = __DEV__ 
  ? 'https://safezone-h0u2.onrender.com/api'  // 개발 환경
  : 'https://safezone-h0u2.onrender.com/api';  // 프로덕션 환경

class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * 인터셉터 설정
   */
  private setupInterceptors() {
    // 요청 인터셉터
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`📤 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('요청 인터셉터 에러:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`📥 API 응답: ${response.config.url} - ${response.status}`);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // 401 에러이고 재시도하지 않은 요청인 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // 이미 토큰 갱신 중이면 대기열에 추가
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.api(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await this.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            // 토큰 갱신
            const response = await this.api.post('/auth/refresh', { refreshToken });
            const { accessToken, refreshToken: newRefreshToken } = response.data;

            await this.setAuthToken(accessToken);
            if (newRefreshToken) {
              await this.setRefreshToken(newRefreshToken);
            }

            // 대기 중인 요청들 재실행
            this.failedQueue.forEach(({ resolve }) => resolve(accessToken));
            this.failedQueue = [];

            // 원래 요청 재실행
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // 토큰 갱신 실패
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            await this.handleUnauthorized();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        console.error('API 에러:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Access Token 저장
   */
  async setAuthToken(token: string): Promise<void> {
    this.authToken = token;
    await AsyncStorage.setItem('authToken', token);
  }

  /**
   * Access Token 가져오기
   */
  async getAuthToken(): Promise<string | null> {
    if (this.authToken) {
      return this.authToken;
    }
    
    const token = await AsyncStorage.getItem('authToken');
    this.authToken = token;
    return token;
  }

  /**
   * Access Token 삭제
   */
  async clearAuthToken(): Promise<void> {
    this.authToken = null;
    await AsyncStorage.removeItem('authToken');
  }

  /**
   * Refresh Token 저장
   */
  async setRefreshToken(token: string): Promise<void> {
    this.refreshToken = token;
    await AsyncStorage.setItem('refreshToken', token);
  }

  /**
   * Refresh Token 가져오기
   */
  async getRefreshToken(): Promise<string | null> {
    if (this.refreshToken) {
      return this.refreshToken;
    }
    
    const token = await AsyncStorage.getItem('refreshToken');
    this.refreshToken = token;
    return token;
  }

  /**
   * Refresh Token 삭제
   */
  async clearRefreshToken(): Promise<void> {
    this.refreshToken = null;
    await AsyncStorage.removeItem('refreshToken');
  }

  /**
   * 401 에러 처리 (로그아웃)
   */
  private async handleUnauthorized(): Promise<void> {
    await this.clearAuthToken();
    await this.clearRefreshToken();
    
    Alert.alert(
      '세션 만료',
      '다시 로그인해주세요.',
      [{ text: '확인' }]
    );
  }

  /**
   * GET 요청
   */
  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  /**
   * POST 요청
   */
  async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  /**
   * PUT 요청
   */
  async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  /**
   * DELETE 요청
   */
  async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }

  /**
   * 에러 메시지 추출
   */
  getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
      if (error.message) {
        return error.message;
      }
    }
    if (error instanceof Error) {
      return error.message;
    }
    return '알 수 없는 오류가 발생했습니다.';
  }

  /**
   * API 상태 확인
   */
  async healthCheck() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      console.error('API 상태 확인 실패:', error);
      return null;
    }
  }
}

export default new ApiService();