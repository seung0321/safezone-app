// src/screens/NotificationSettingsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Colors from '../constants/Colors';
import { useNotifications } from '../context/NotificationContext';
import notificationService from '../services/notificationService';
import { RootStackParamList } from '../../App';

type NotificationSettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NotificationSettings'
>;

interface NotificationSettingsScreenProps {
  navigation: NotificationSettingsScreenNavigationProp;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ navigation }) => {
  const { settings, updateSettings, toggleNotifications } = useNotifications();

  /**
   * 전체 알림 토글
   */
  const handleToggleAll = async (value: boolean) => {
    await toggleNotifications(value);
    
    if (value) {
      Alert.alert('알림 켜짐', '모든 알림을 받을 수 있습니다.');
    } else {
      Alert.alert('알림 꺼짐', '모든 알림이 차단됩니다.');
    }
  };

  /**
   * 테스트 알림 전송
   */
  const sendTestNotification = async () => {
    if (!settings.enabled) {
      Alert.alert('알림이 꺼져있습니다', '알림을 켜고 다시 시도해주세요.');
      return;
    }

    await notificationService.sendLocalNotification(
      '🛡️ 테스트 알림',
      '알림이 정상적으로 작동하고 있습니다!'
    );

    Alert.alert('테스트 알림 전송', '알림을 확인해주세요.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 설정</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* 전체 알림 */}
        <View style={styles.section}>
          <View style={styles.mainToggle}>
            <View>
              <Text style={styles.mainToggleTitle}>알림 받기</Text>
              <Text style={styles.mainToggleSubtitle}>
                모든 푸시 알림을 {settings.enabled ? '받습니다' : '받지 않습니다'}
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggleAll}
              trackColor={{ false: Colors.bgLight, true: Colors.primary }}
              thumbColor={settings.enabled ? Colors.primaryLight : Colors.textSecondary}
            />
          </View>
        </View>

        {/* 상세 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 종류</Text>

          {/* 경로 알림 */}
          <View style={[styles.settingItem, !settings.enabled && styles.disabled]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>🗺️ 경로 알림</Text>
              <Text style={styles.settingDescription}>
                경로 안내 시작/종료 알림
              </Text>
            </View>
            <Switch
              value={settings.routeNotifications}
              onValueChange={(value) => updateSettings({ routeNotifications: value })}
              disabled={!settings.enabled}
              trackColor={{ false: Colors.bgLight, true: Colors.primary }}
              thumbColor={settings.routeNotifications ? Colors.primaryLight : Colors.textSecondary}
            />
          </View>

          {/* 커뮤니티 알림 */}
          <View style={[styles.settingItem, !settings.enabled && styles.disabled]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>💬 커뮤니티 알림</Text>
              <Text style={styles.settingDescription}>
                댓글, 답글 알림
              </Text>
            </View>
            <Switch
              value={settings.communityNotifications}
              onValueChange={(value) => updateSettings({ communityNotifications: value })}
              disabled={!settings.enabled}
              trackColor={{ false: Colors.bgLight, true: Colors.primary }}
              thumbColor={settings.communityNotifications ? Colors.primaryLight : Colors.textSecondary}
            />
          </View>

          {/* 위험 알림 */}
          <View style={[styles.settingItem, !settings.enabled && styles.disabled]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>⚠️ 위험 알림</Text>
              <Text style={styles.settingDescription}>
                실시간 위험 접근 알림 (권장)
              </Text>
            </View>
            <Switch
              value={settings.dangerAlerts}
              onValueChange={(value) => updateSettings({ dangerAlerts: value })}
              disabled={!settings.enabled}
              trackColor={{ false: Colors.bgLight, true: Colors.primary }}
              thumbColor={settings.dangerAlerts ? Colors.primaryLight : Colors.textSecondary}
            />
          </View>

          {/* 위치 공유 알림 */}
          <View style={[styles.settingItem, !settings.enabled && styles.disabled]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>📍 위치 공유 알림</Text>
              <Text style={styles.settingDescription}>
                위치 공유 시작/종료 알림
              </Text>
            </View>
            <Switch
              value={settings.locationShareNotifications}
              onValueChange={(value) => updateSettings({ locationShareNotifications: value })}
              disabled={!settings.enabled}
              trackColor={{ false: Colors.bgLight, true: Colors.primary }}
              thumbColor={settings.locationShareNotifications ? Colors.primaryLight : Colors.textSecondary}
            />
          </View>
        </View>

        {/* 테스트 버튼 */}
        <TouchableOpacity
          style={[styles.testButton, !settings.enabled && styles.testButtonDisabled]}
          onPress={sendTestNotification}
          disabled={!settings.enabled}
        >
          <Text style={styles.testButtonText}>테스트 알림 보내기</Text>
        </TouchableOpacity>

        {/* 안내 */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 알림은 앱이 백그라운드나 종료 상태에서도 수신됩니다.
          </Text>
          <Text style={styles.infoText}>
            ⚠️ 위험 알림은 안전을 위해 항상 켜두는 것을 권장합니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bgLight,
  },
  backButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  mainToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    padding: 20,
    borderRadius: 16,
  },
  mainToggleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  mainToggleSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  disabled: {
    opacity: 0.4,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  testButton: {
    backgroundColor: Colors.primary,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: Colors.bgLight,
    opacity: 0.5,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  infoBox: {
    backgroundColor: Colors.bgLight,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default NotificationSettingsScreen;