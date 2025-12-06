// src/api/authService.ts
import { apiRequest, saveTokens, clearTokens } from './config';

export interface RegisterData {
  name: string;
  nickname: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface EmailVerificationData {
  email: string;
  code: string;
  purpose: 'signup' | 'reset_password';
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;  // ✅ 추가
}

class AuthService {
  /**
   * 이메일 인증 코드 발송
   * 백엔드: POST /auth/email/send
   * ✅ 인증 없이 호출 가능해야 함
   */
  async sendEmailVerification(
    email: string,
    purpose: 'signup' | 'reset_password'
  ): Promise<any> {
    console.log('📧 이메일 인증 코드 발송 시작:', { email, purpose });
    
    try {
      // ✅ 헤더에서 Authorization을 명시적으로 제외
      const response = await apiRequest('/auth/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization 헤더를 추가하지 않음
        },
        body: JSON.stringify({ email, purpose }),
      });
      
      console.log('✅ 이메일 인증 코드 발송 성공:', response);
      return response;
    } catch (error: any) {
      console.error('❌ 이메일 인증 코드 발송 실패:', error);
      throw new Error(error.message || '이메일 인증 코드 발송에 실패했습니다.');
    }
  }

  /**
   * 이메일 인증 코드 확인
   * 백엔드: POST /auth/email/verify
   */
  async verifyEmailCode(data: EmailVerificationData): Promise<any> {
    console.log('🔍 이메일 인증 코드 확인 시작:', data);
    
    try {
      const response = await apiRequest('/auth/email/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      console.log('✅ 이메일 인증 코드 확인 성공:', response);
      return response;
    } catch (error: any) {
      console.error('❌ 이메일 인증 코드 확인 실패:', error);
      throw new Error(error.message || '인증 코드가 올바르지 않습니다.');
    }
  }

  /**
   * 회원가입
   * 백엔드: POST /auth/register
   */
  async register(data: RegisterData): Promise<any> {
    const cleanData = {
      name: String(data.name || '').trim(),
      nickname: String(data.nickname || '').trim(),
      email: String(data.email || '').trim(),
      phone: String(data.phone || '').replace(/\D/g, ''),
      password: String(data.password || ''),
      confirmPassword: String(data.confirmPassword || ''),
    };
    
    console.log('📝 회원가입 요청:', cleanData);
    
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
    
    if (response.tokens?.accessToken && response.tokens?.refreshToken) {
      await saveTokens(response.tokens.accessToken, response.tokens.refreshToken);
    }
    
    return response;
  }

  /**
   * 로그인
   * 백엔드: POST /auth/login
   */
  async login(data: LoginData): Promise<any> {
    console.log('🔐 로그인 요청:', { email: data.email });
    
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.tokens?.accessToken && response.tokens?.refreshToken) {
      await saveTokens(response.tokens.accessToken, response.tokens.refreshToken);
      console.log('✅ 토큰 저장 완료');
    }
    
    return response;
  }

  /**
   * 로그아웃
   * 백엔드: POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      await clearTokens();
    }
  }

  /**
   * 토큰 재발급
   * 백엔드: POST /auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<any> {
    const response = await apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    if (response.accessToken && response.refreshToken) {
      await saveTokens(response.accessToken, response.refreshToken);
    }
    
    return response;
  }

  /**
   * 아이디 찾기
   * 백엔드: POST /auth/find-id
   */
  async findId(email: string): Promise<any> {
    return await apiRequest('/auth/find-id', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * 비밀번호 재설정
   * 백엔드: POST /auth/reset-password
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    console.log('🔒 비밀번호 재설정 요청:', { 
      email: data.email,
      code: data.code,
      newPassword: '***',
      confirmPassword: '***'
    });
    
    try {
      // ✅ 여러 형식 시도
      // 옵션 1: verificationCode 필드명 사용
      const requestBody1 = {
        email: data.email,
        verificationCode: data.code,  // code → verificationCode
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      // 옵션 2: code 없이 요청 (이미 인증됨)
      const requestBody2 = {
        email: data.email,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      // 옵션 3: password 필드명 사용
      const requestBody3 = {
        email: data.email,
        code: data.code,
        password: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      // ✅ 먼저 옵션 2 시도 (code 없이)
      try {
        console.log('🔄 시도 1: code 없이 요청');
        await apiRequest('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify(requestBody2),
        });
        console.log('✅ 비밀번호 재설정 성공 (code 없이)');
        return;
      } catch (error: any) {
        console.log('❌ 시도 1 실패, 다음 방법 시도');
      }

      // ✅ 옵션 1 시도 (verificationCode)
      try {
        console.log('🔄 시도 2: verificationCode 필드 사용');
        await apiRequest('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify(requestBody1),
        });
        console.log('✅ 비밀번호 재설정 성공 (verificationCode)');
        return;
      } catch (error: any) {
        console.log('❌ 시도 2 실패, 다음 방법 시도');
      }

      // ✅ 옵션 3 시도 (password)
      try {
        console.log('🔄 시도 3: password 필드 사용');
        await apiRequest('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify(requestBody3),
        });
        console.log('✅ 비밀번호 재설정 성공 (password)');
        return;
      } catch (error: any) {
        console.log('❌ 모든 시도 실패');
        throw error;
      }
      
    } catch (error: any) {
      console.error('❌ 비밀번호 재설정 실패:', error);
      throw new Error(error.message || '비밀번호 재설정에 실패했습니다.');
    }
  }
}

export default new AuthService();