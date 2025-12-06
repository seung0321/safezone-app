// src/screens/EmailVerificationScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Colors from '../constants/Colors';
import { RootStackParamList } from '../../App';
import authService from '../api/authService';

type EmailVerificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EmailVerification'
>;

type EmailVerificationScreenRouteProp = RouteProp<
  RootStackParamList,
  'EmailVerification'
>;

interface EmailVerificationScreenProps {
  navigation: EmailVerificationScreenNavigationProp;
  route: EmailVerificationScreenRouteProp;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { email } = route.params;
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(180); // 3분 = 180초
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    // 타이머 시작
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * 시간 포맷팅 (MM:SS)
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 코드 입력 처리
   */
  const handleCodeChange = (text: string, index: number) => {
    // 숫자만 입력 가능
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // 다음 입력창으로 자동 이동
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 6자리가 모두 입력되면 자동 검증
    if (newCode.every((digit) => digit !== '') && text) {
      handleVerify(newCode.join(''));
    }
  };

  /**
   * 백스페이스 처리
   */
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * 인증 코드 검증
   */
  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');

    if (codeToVerify.length !== 6) {
      Alert.alert('입력 오류', '6자리 인증 코드를 모두 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 백엔드 API 호출
      await authService.verifyEmailCode({
        email,
        code: codeToVerify,
        purpose: 'signup',
      });

      Alert.alert(
        '인증 완료',
        '이메일 인증이 완료되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('Signup', { 
              email, 
              verified: true 
            }),
          },
        ]
      );
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert('인증 실패', error.message || '잘못된 인증 코드입니다. 다시 시도해주세요.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  /**
   * 인증 코드 재전송
   */
  const handleResendCode = async () => {
    if (!canResend) return;

    setResendLoading(true);

    try {
      // 백엔드 API 호출
      await authService.sendEmailVerification(email, 'signup');

      Alert.alert('재전송 완료', '인증 코드가 재전송되었습니다.');
      
      // 타이머 리셋
      setTimer(180);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      Alert.alert('오류', error.message || '인증 코드 재전송에 실패했습니다.');
      console.error('Resend error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  /**
   * 이메일 변경 (뒤로 가기)
   */
  const handleChangeEmail = () => {
    Alert.alert(
      '이메일 변경',
      '이메일을 변경하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '변경',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#3C365C', Colors.bgDark]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleChangeEmail}>
              <Text style={styles.backButton}>← 뒤로</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.emoji}>📧</Text>
            <Text style={styles.title}>이메일 인증</Text>
            <Text style={styles.subtitle}>
              {email}로{'\n'}
              인증 코드를 전송했습니다
            </Text>
          </View>

          {/* Code Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={digit ? [styles.codeInput, styles.codeInputFilled] : styles.codeInput}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
            ))}
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                남은 시간: {formatTime(timer)}
              </Text>
            ) : (
              <Text style={styles.expiredText}>
                인증 코드가 만료되었습니다
              </Text>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (loading || code.some((d) => !d)) && styles.verifyButtonDisabled,
            ]}
            onPress={() => handleVerify()}
            disabled={loading || code.some((d) => !d)}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textPrimary} />
            ) : (
              <Text style={styles.verifyButtonText}>인증하기</Text>
            )}
          </TouchableOpacity>

          {/* Resend Button */}
          <TouchableOpacity
            style={[
              styles.resendButton,
              !canResend && styles.resendButtonDisabled,
            ]}
            onPress={handleResendCode}
            disabled={!canResend || resendLoading}
          >
            {resendLoading ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <Text
                style={[
                  styles.resendButtonText,
                  !canResend && styles.resendButtonTextDisabled,
                ]}
              >
                인증 코드 재전송
              </Text>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • 인증 코드가 도착하지 않았나요?
            </Text>
            <Text style={styles.infoText}>
              • 스팸 메일함을 확인해보세요
            </Text>
            <Text style={styles.infoText}>
              • 이메일 주소가 정확한지 확인해주세요
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 10,
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  codeInput: {
    width: 48,
    height: 56,
    backgroundColor: Colors.bgLight,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: Colors.bgLight,
  },
  codeInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  expiredText: {
    fontSize: 16,
    color: Colors.danger,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonDisabled: {
    backgroundColor: Colors.bgLight,
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  infoContainer: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default EmailVerificationScreen;