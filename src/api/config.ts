// src/api/config.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  NetworkError,
} from './errors';

// API Base URL
export const API_BASE_URL = __DEV__
  ? 'https://safezone-h0u2.onrender.com'  // ✅ Render 백엔드 URL
  : 'https://safezone-h0u2.onrender.com';  // ✅ 프로덕션도 동일

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@access_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
};

// 토큰 갱신 중 플래그
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * 대기 중인 요청 처리
 */
const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * 토큰 갱신
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '토큰 갱신 실패');
    }

    // 새 토큰 저장
    if (data.accessToken && data.refreshToken) {
      await saveTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    }

    throw new Error('토큰 갱신 실패');
  } catch (error) {
    // 갱신 실패 시 로그아웃 처리
    await clearTokens();
    throw error;
  }
};

/**
 * API 요청을 위한 기본 fetch wrapper
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 기존 헤더 병합
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  // 인증이 필요한 요청인 경우 토큰 추가
  if (accessToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    // ✅ endpoint에 /api를 붙여서 요청
    const fullUrl = `${API_BASE_URL}/api${endpoint}`;
    console.log(`📤 API 요청: ${options.method || 'GET'} ${fullUrl}`);
    
    const response = await fetch(fullUrl, config);

    // 204 No Content 처리
    if (response.status === 204) {
      console.log(`📥 API 응답: ${endpoint} - 204 (No Content)`);
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ API 에러: ${endpoint} - ${response.status}`, data);

      // 401 Unauthorized - 토큰 만료
      if (response.status === 401) {
        // 이미 토큰 갱신 중이면 대기
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              // 갱신된 토큰으로 재시도
              headers['Authorization'] = `Bearer ${token}`;
              return apiRequest(endpoint, { ...options, headers });
            })
            .catch((err) => {
              throw new UnauthorizedError('인증에 실패했습니다.');
            });
        }

        // 토큰 갱신 시도
        isRefreshing = true;

        try {
          const newAccessToken = await refreshAccessToken();
          processQueue(null, newAccessToken);

          // 원래 요청 재시도
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          return await apiRequest(endpoint, { ...options, headers });
        } catch (refreshError) {
          processQueue(refreshError, null);
          
          // 갱신 실패 시 로그인 화면으로 이동 안내
          Alert.alert(
            '세션 만료',
            '다시 로그인해주세요.',
            [{ text: '확인' }]
          );
          
          throw new Error('UNAUTHORIZED');
        } finally {
          isRefreshing = false;
        }
      }

      // 400 Bad Request
      if (response.status === 400) {
        throw new Error(data.message || '잘못된 요청입니다.');
      }

      // 403 Forbidden
      if (response.status === 403) {
        throw new Error(data.message || '권한이 없습니다.');
      }

      // 404 Not Found
      if (response.status === 404) {
        throw new Error(data.message || '요청한 리소스를 찾을 수 없습니다.');
      }

      // 409 Conflict
      if (response.status === 409) {
        throw new Error(data.message || '이미 존재하는 데이터입니다.');
      }

      // 기타 에러
      throw new Error(data.message || `API 요청 실패 (${response.status})`);
    }

    console.log(`📥 API 응답: ${endpoint} - ${response.status}`);
    return data;
  } catch (error: any) {
    console.error('❌ API Request Error:', error.message);
    
    // 네트워크 에러 처리
    if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      throw new NetworkError('네트워크 연결을 확인해주세요.');
    }
    
    throw error;
  }
};

/**
 * 토큰 저장
 */
export const saveTokens = async (accessToken: string, refreshToken: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    console.log('✅ 토큰 저장 완료');
  } catch (error) {
    console.error('❌ 토큰 저장 실패:', error);
    throw error;
  }
};

/**
 * 토큰 삭제
 */
export const clearTokens = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    console.log('✅ 토큰 삭제 완료');
  } catch (error) {
    console.error('❌ 토큰 삭제 실패:', error);
  }
};

/**
 * Access Token 가져오기
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('토큰 가져오기 실패:', error);
    return null;
  }
};

/**
 * Refresh Token 가져오기
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('리프레시 토큰 가져오기 실패:', error);
    return null;
  }
};