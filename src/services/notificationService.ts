// src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationType } from '../context/NotificationContext';

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * 푸시 알림 초기화
   */
  async initialize(): Promise<string | null> {
    try {
      // 권한 요청
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ 푸시 알림 권한이 거부되었습니다');
        return null;
      }

      // Push Token 가져오기 (실제 앱에서는 백엔드로 전송)
      const token = await this.getExpoPushToken();
      this.expoPushToken = token;

      console.log('✅ 푸시 알림 초기화 완료');
      console.log('📱 Push Token:', token);

      return token;
    } catch (error) {
      console.error('❌ 푸시 알림 초기화 실패:', error);
      return null;
    }
  }

  /**
   * Expo Push Token 가져오기
   */
  private async getExpoPushToken(): Promise<string> {
    // 실제 앱에서는 projectId 필요
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  }

  /**
   * 로컬 알림 전송 (테스트용)
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // 즉시 전송
    });
  }

  /**
   * 타입별 알림 전송
   */
  async sendTypedNotification(
    type: NotificationType,
    data?: any
  ): Promise<void> {
    const notification = this.getNotificationContent(type, data);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: {
          type,
          ...data,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });

    console.log(`📨 알림 전송: ${type}`);
  }

  /**
   * 타입별 알림 내용 가져오기
   */
  private getNotificationContent(
    type: NotificationType,
    data?: any
  ): { title: string; body: string } {
    switch (type) {
      case 'route_start':
        return {
          title: '🗺️ 경로 안내 시작',
          body: data?.destination 
            ? `${data.destination}까지 안전하게 안내합니다`
            : '안전한 경로로 안내를 시작합니다',
        };

      case 'route_end':
        return {
          title: '✅ 경로 안내 완료',
          body: '목적지에 안전하게 도착했습니다',
        };

      case 'community_reply':
        return {
          title: '💬 새 댓글',
          body: data?.postTitle 
            ? `"${data.postTitle}" 게시글에 새 댓글이 달렸습니다`
            : '작성하신 게시글에 새 댓글이 달렸습니다',
        };

      case 'community_comment':
        return {
          title: '💬 새 답글',
          body: data?.userName 
            ? `${data.userName}님이 회원님의 댓글에 답글을 달았습니다`
            : '회원님의 댓글에 새 답글이 달렸습니다',
        };

      case 'danger_alert':
        return {
          title: '⚠️ 위험 알림',
          body: data?.message 
            ? data.message
            : '현재 위치 주변에 위험 요소가 감지되었습니다',
        };

      case 'location_share_start':
        return {
          title: '📍 위치 공유 시작',
          body: data?.contactName 
            ? `${data.contactName}님과 위치 공유를 시작했습니다`
            : '긴급 연락망과 위치 공유를 시작했습니다',
        };

      case 'location_share_end':
        return {
          title: '📍 위치 공유 종료',
          body: '위치 공유가 종료되었습니다',
        };

      default:
        return {
          title: '🛡️ SafeRoute',
          body: '새로운 알림이 있습니다',
        };
    }
  }

  /**
   * 배지 카운트 설정
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * 배지 카운트 증가
   */
  async increaseBadgeCount(): Promise<void> {
    const current = await Notifications.getBadgeCountAsync();
    await this.setBadgeCount(current + 1);
  }

  /**
   * 배지 카운트 초기화
   */
  async clearBadgeCount(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * 예약된 알림 모두 취소
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.expoPushToken = null;
  }

  /**
   * Push Token 가져오기 (백엔드 전송용)
   */
  getToken(): string | null {
    return this.expoPushToken;
  }
}

// Singleton 인스턴스
const notificationService = new NotificationService();

export default notificationService;