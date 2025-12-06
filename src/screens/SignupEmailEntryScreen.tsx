// src/screens/SignupEmailEntryScreen.tsx
import React, { useState } from 'react';
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
import Colors from '../constants/Colors';
import { RootStackParamList } from '../../App';
import authService from '../api/authService';

type SignupEmailEntryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SignupEmailEntry'
>;

interface SignupEmailEntryScreenProps {
  navigation: SignupEmailEntryScreenNavigationProp;
}

const SignupEmailEntryScreen: React.FC<SignupEmailEntryScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * 이메일 유효성 검사
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * 인증 코드 전송
   */
  const handleSendVerification = async () => {
    // 이메일 유효성 검사
    if (!email.trim()) {
      Alert.alert('입력 오류', '이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('입력 오류', '올바른 이메일 형식이 아닙니다.');
      return;
    }

    setLoading(true);

    try {
      // 백엔드 API 호출
      await authService.sendEmailVerification(email.trim(), 'signup');
      
      // 이메일 인증 화면으로 이동
      navigation.navigate('EmailVerification', { email: email.trim() });
    } catch (error: any) {
      if (error.message.includes('already')) {
        Alert.alert(
          '이미 가입된 이메일',
          '이미 가입된 이메일입니다. 로그인하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '로그인',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('오류', error.message || '인증 코드 전송에 실패했습니다. 다시 시도해주세요.');
      }
      console.error('Send verification error:', error);
    } finally {
      setLoading(false);
    }
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← 뒤로</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.emoji}>✉️</Text>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>
              이메일 주소를 입력하면{'\n'}
              인증 코드를 보내드립니다
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="이메일을 입력하세요"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!email || loading) && styles.nextButtonDisabled,
            ]}
            onPress={handleSendVerification}
            disabled={!email || loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textPrimary} />
            ) : (
              <Text style={styles.nextButtonText}>인증 코드 전송</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>로그인</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>📌 안내</Text>
            <Text style={styles.infoText}>
              • 입력하신 이메일로 6자리 인증 코드가 전송됩니다
            </Text>
            <Text style={styles.infoText}>
              • 인증 코드는 3분간 유효합니다
            </Text>
            <Text style={styles.infoText}>
              • 스팸 메일함도 확인해주세요
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
    marginBottom: 50,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
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
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 2,
    borderColor: Colors.bgLight,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.bgLight,
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  loginText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  infoContainer: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default SignupEmailEntryScreen;