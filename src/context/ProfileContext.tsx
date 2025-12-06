// src/context/ProfileContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import userService, { UserProfile } from '../api/userService';

interface ProfileContextType {
  profileData: UserProfile;
  loading: boolean;
  updateProfile: (data: { nickname?: string; phone?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  id: 0,
  name: '',
  nickname: '',
  email: '',
  phone: '',
  createdAt: '',
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(false);

  // ✅ 프로필 불러오기
  const refreshProfile = async () => {
    setLoading(true);
    try {
      const data = await userService.getMyProfile();
      setProfileData(data);
      console.log('✅ 프로필 로드 성공:', data);
    } catch (error) {
      console.error('❌ 프로필 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 프로필 업데이트
  const updateProfile = async (data: { nickname?: string; phone?: string }) => {
    setLoading(true);
    try {
      const response = await userService.updateMyProfile(data);
      
      // 응답 구조 확인 후 업데이트
      if (response.profile) {
        setProfileData(response.profile);
      } else {
        // 응답에 profile이 없으면 다시 조회
        await refreshProfile();
      }
      
      console.log('✅ 프로필 업데이트 성공:', response);
    } catch (error) {
      console.error('❌ 프로필 업데이트 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ✅ 앱 시작 시 프로필 로드
  useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profileData, loading, updateProfile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};