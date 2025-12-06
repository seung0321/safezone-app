// src/api/userService.ts
import { apiRequest, clearTokens } from './config';

export interface UserProfile {
  id: number;
  name: string;
  nickname: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface UpdateProfileData {
  nickname?: string;  // ✅ 닉네임만 수정 가능
  phone?: string;     // ✅ 핸드폰번호만 수정 가능
}

class UserService {
  /**
   * 내 프로필 조회
   * 백엔드: GET /users/me
   */
  async getMyProfile(): Promise<UserProfile> {
    return await apiRequest('/users/me', {
      method: 'GET',
    });
  }

  /**
   * 프로필 수정 (닉네임, 핸드폰번호만)
   * 백엔드: PATCH /users/me
   * 요청: { nickname?, phone? }
   */
  async updateMyProfile(data: UpdateProfileData): Promise<any> {
    // ✅ 핸드폰번호 정제
    const cleanData: UpdateProfileData = {};
    
    if (data.nickname !== undefined) {
      cleanData.nickname = String(data.nickname).trim();
    }
    
    if (data.phone !== undefined) {
      cleanData.phone = String(data.phone).replace(/\D/g, '');
    }

    console.log('📤 프로필 수정 요청:', cleanData);

    return await apiRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(cleanData),
    });
  }

  /**
   * 계정 삭제
   * 백엔드: DELETE /users/me
   * 응답: 200 OK
   */
  async deleteAccount(): Promise<void> {
    try {
      await apiRequest('/users/me', {
        method: 'DELETE',
      });
    } finally {
      // 계정 삭제 후 토큰 삭제
      await clearTokens();
    }
  }
}

export default new UserService();