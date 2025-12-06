// src/screens/AccountDeletionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Colors from '../constants/Colors';
import { RootStackParamList } from '../../App';
import userService from '../api/userService';
import authService from '../api/authService';

type AccountDeletionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AccountDeletion'
>;

interface AccountDeletionScreenProps {
  navigation: AccountDeletionScreenNavigationProp;
}

const AccountDeletionScreen: React.FC<AccountDeletionScreenProps> = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  // 탈퇴 사유 목록
  const reasons = [
    '사용 빈도가 낮아서',
    '다른 서비스를 이용하려고',
    '개인정보 보호 우려',
    '서비스가 만족스럽지 않아서',
    '기능이 부족해서',
    '기타',
  ];

  /**
   * 탈퇴 사유 선택 토글
   */
  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  /**
   * 유효성 검사
   */
  const validateForm = (): boolean => {
    if (!password.trim()) {
      Alert.alert('입력 오류', '비밀번호를 입력해주세요.');
      return false;
    }

    if (selectedReasons.length === 0) {
      Alert.alert('입력 오류', '탈퇴 사유를 최소 1개 이상 선택해주세요.');
      return false;
    }

    if (selectedReasons.includes('기타') && !otherReason.trim()) {
      Alert.alert('입력 오류', '기타 사유를 입력해주세요.');
      return false;
    }

    if (!agreed) {
      Alert.alert('동의 필요', '탈퇴 안내사항을 확인하고 동의해주세요.');
      return false;
    }

    return true;
  };

  /**
   * 회원 탈퇴 처리
   */
  const handleDeleteAccount = async () => {
    if (!validateForm()) return;

    // 최종 확인
    Alert.alert(
      '⚠️ 정말 탈퇴하시겠습니까?',
      '탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);

            try {
              // 백엔드 API 호출 - 회원 탈퇴
              await userService.deleteAccount();
              
              // 로그아웃 처리 (토큰 삭제)
              await authService.logout();

              Alert.alert(
                '탈퇴 완료',
                '그동안 SafeRoute를 이용해주셔서 감사합니다.',
                [
                  {
                    text: '확인',
                    onPress: () => {
                      // 로그인 화면으로 이동
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                      });
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('Account deletion error:', error);
              Alert.alert('오류', error.message || '탈퇴 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회원 탈퇴</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 경고 메시지 */}
        <View style={styles.warningBox}>
          <Text style={styles.warningEmoji}>⚠️</Text>
          <Text style={styles.warningTitle}>탈퇴 전 꼭 확인하세요!</Text>
          <Text style={styles.warningText}>
            • 탈퇴 시 모든 개인정보와 활동 기록이 삭제됩니다
          </Text>
          <Text style={styles.warningText}>
            • 작성한 게시글과 댓글은 삭제되지 않습니다
          </Text>
          <Text style={styles.warningText}>
            • 삭제된 데이터는 복구할 수 없습니다
          </Text>
          <Text style={styles.warningText}>
            • 탈퇴 후 30일간 재가입이 제한됩니다
          </Text>
        </View>

        {/* 비밀번호 확인 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>비밀번호 확인</Text>
          <Text style={styles.sectionDescription}>
            본인 확인을 위해 비밀번호를 입력해주세요
          </Text>
          <TextInput
            style={styles.passwordInput}
            placeholder="현재 비밀번호"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        {/* 탈퇴 사유 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>탈퇴 사유</Text>
          <Text style={styles.sectionDescription}>
            서비스 개선을 위해 탈퇴 사유를 알려주세요 (복수 선택 가능)
          </Text>
          <View style={styles.reasonsContainer}>
            {reasons.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonItem,
                  selectedReasons.includes(reason) && styles.reasonItemSelected,
                ]}
                onPress={() => toggleReason(reason)}
                disabled={loading}
              >
                <View
                  style={[
                    styles.checkbox,
                    selectedReasons.includes(reason) && styles.checkboxSelected,
                  ]}
                >
                  {selectedReasons.includes(reason) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.reasonText,
                    selectedReasons.includes(reason) && styles.reasonTextSelected,
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 기타 사유 입력 */}
          {selectedReasons.includes('기타') && (
            <TextInput
              style={styles.otherReasonInput}
              placeholder="기타 사유를 입력해주세요"
              placeholderTextColor={Colors.textSecondary}
              value={otherReason}
              onChangeText={setOtherReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!loading}
            />
          )}
        </View>

        {/* 동의 체크박스 */}
        <TouchableOpacity
          style={styles.agreementContainer}
          onPress={() => setAgreed(!agreed)}
          disabled={loading}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxSelected]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.agreementText}>
            위 안내사항을 모두 확인했으며 탈퇴에 동의합니다
          </Text>
        </TouchableOpacity>

        {/* 탈퇴 버튼 */}
        <TouchableOpacity
          style={[
            styles.deleteButton,
            (!agreed || loading) && styles.deleteButtonDisabled,
          ]}
          onPress={handleDeleteAccount}
          disabled={!agreed || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textPrimary} />
          ) : (
            <Text style={styles.deleteButtonText}>회원 탈퇴</Text>
          )}
        </TouchableOpacity>

        {/* 안내 */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            탈퇴 관련 문의사항이 있으시면 고객센터로 연락주세요.
          </Text>
          <Text style={styles.infoText}>
            📧 support@saferoute.com
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  warningEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.danger,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 15,
    lineHeight: 20,
  },
  passwordInput: {
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 2,
    borderColor: Colors.bgLight,
  },
  reasonsContainer: {
    gap: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.bgLight,
  },
  reasonItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  reasonText: {
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  reasonTextSelected: {
    fontWeight: '600',
  },
  otherReasonInput: {
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginTop: 12,
    height: 80,
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  agreementText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteButtonDisabled: {
    backgroundColor: Colors.bgLight,
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  infoBox: {
    backgroundColor: Colors.bgLight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default AccountDeletionScreen;