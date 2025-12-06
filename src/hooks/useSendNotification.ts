// src/hooks/useSendNotification.ts
import { useNotifications, NotificationType } from '../context/NotificationContext';
import notificationService from '../services/notificationService';

/**
 * 알림 전송 Hook
 * 설정에 따라 알림을 보내거나 차단
 */
export const useSendNotification = () => {
  const { canSendNotification } = useNotifications();

  /**
   * 알림 전송
   */
  const sendNotification = async (
    type: NotificationType,
    data?: any
  ): Promise<boolean> => {
    // 알림 설정 확인
    if (!canSendNotification(type)) {
      console.log(`🚫 알림 차단됨: ${type} (사용자 설정)`);
      return false;
    }

    // 알림 전송
    try {
      await notificationService.sendTypedNotification(type, data);
      console.log(`✅ 알림 전송 성공: ${type}`);
      return true;
    } catch (error) {
      console.error(`❌ 알림 전송 실패: ${type}`, error);
      return false;
    }
  };

  return { sendNotification };
};

// 사용 예시:
/*
import { useSendNotification } from '../hooks/useSendNotification';

const MyComponent = () => {
  const { sendNotification } = useSendNotification();

  const handleRouteStart = async () => {
    // 경로 시작 알림
    await sendNotification('route_start', { 
      destination: '강남역' 
    });
  };

  const handleDangerDetected = async () => {
    // 위험 알림
    await sendNotification('danger_alert', { 
      message: '전방 100m에 위험 요소가 감지되었습니다' 
    });
  };

  return (
    // ...
  );
};
*/