// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 알림 타입 정의
export type NotificationType = 
  | 'route_start'           // 경로 안내 시작
  | 'route_end'             // 경로 안내 종료
  | 'community_reply'       // 커뮤니티 댓글
  | 'community_comment'     // 커뮤니티 답글
  | 'danger_alert'          // 실시간 위험 접근 알림
  | 'location_share_start'  // 위치 공유 시작
  | 'location_share_end';   // 위치 공유 종료

// 알림 설정 인터페이스
export interface NotificationSettings {
  enabled: boolean;  // 전체 알림 켜기/끄기
  routeNotifications: boolean;  // 경로 알림
  communityNotifications: boolean;  // 커뮤니티 알림
  dangerAlerts: boolean;  // 위험 알림
  locationShareNotifications: boolean;  // 위치 공유 알림
}

// Context 타입
interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  canSendNotification: (type: NotificationType) => boolean;
}

// 기본값
const defaultSettings: NotificationSettings = {
  enabled: true,
  routeNotifications: true,
  communityNotifications: true,
  dangerAlerts: true,
  locationShareNotifications: true,
};

const STORAGE_KEY = '@notification_settings';

// Context 생성
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider 컴포넌트
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  // 앱 시작 시 저장된 설정 불러오기
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * 저장된 알림 설정 불러오기
   */
  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        console.log('✅ 알림 설정 로드:', parsed);
      }
    } catch (error) {
      console.error('알림 설정 로드 실패:', error);
    }
  };

  /**
   * 알림 설정 저장
   */
  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      console.log('💾 알림 설정 저장:', newSettings);
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
    }
  };

  /**
   * 알림 설정 업데이트
   */
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveSettings(updated);
  };

  /**
   * 전체 알림 켜기/끄기
   */
  const toggleNotifications = async (enabled: boolean) => {
    await updateSettings({ enabled });
  };

  /**
   * 특정 타입의 알림을 보낼 수 있는지 확인
   */
  const canSendNotification = (type: NotificationType): boolean => {
    // 전체 알림이 꺼져있으면 무조건 false
    if (!settings.enabled) {
      return false;
    }

    // 타입별 설정 확인
    switch (type) {
      case 'route_start':
      case 'route_end':
        return settings.routeNotifications;
      
      case 'community_reply':
      case 'community_comment':
        return settings.communityNotifications;
      
      case 'danger_alert':
        return settings.dangerAlerts;
      
      case 'location_share_start':
      case 'location_share_end':
        return settings.locationShareNotifications;
      
      default:
        return false;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        settings,
        updateSettings,
        toggleNotifications,
        canSendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom Hook
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};