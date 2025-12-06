// src/screens/PasswordChangeScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import authService from '../api/authService';

interface PasswordChangeScreenProps {
    navigation: any;
}

const PasswordChangeScreen: React.FC<PasswordChangeScreenProps> = ({ navigation }) => {
    const [step, setStep] = useState<'email' | 'verify' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);

    // 1단계: 이메일 인증 코드 발송
    const handleSendVerification = async () => {
        if (!email) {
            Alert.alert('오류', '이메일을 입력해주세요.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
            return;
        }

        setLoading(true);
        try {
            // ✅ 이메일 trim 처리
            const cleanEmail = email.trim().toLowerCase();
            console.log('📧 이메일 인증 코드 발송 시작:', cleanEmail);
            
            await authService.sendEmailVerification(cleanEmail, 'reset_password');
            
            Alert.alert('성공', '인증 코드가 이메일로 발송되었습니다.');
            setEmail(cleanEmail); // 정제된 이메일로 업데이트
            setStep('verify');
        } catch (error: any) {
            console.error('❌ 인증 코드 발송 실패:', error);
            Alert.alert('오류', error.message || '인증 코드 발송에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 2단계: 이메일 인증 코드 확인
    const handleVerifyCode = async () => {
        if (!verificationCode) {
            Alert.alert('오류', '인증 코드를 입력해주세요.');
            return;
        }

        if (verificationCode.length !== 6) {
            Alert.alert('오류', '인증 코드는 6자리여야 합니다.');
            return;
        }

        setLoading(true);
        try {
            // ✅ 코드를 문자열로 확실히 변환
            const codeString = String(verificationCode).trim();
            
            console.log('🔍 인증 코드 확인 요청:', {
                email,
                code: codeString,
                purpose: 'reset_password',
            });
            
            await authService.verifyEmailCode({
                email,
                code: codeString,
                purpose: 'reset_password',
            });
            
            Alert.alert('성공', '이메일 인증이 완료되었습니다.');
            setVerified(true);
            setStep('password');
        } catch (error: any) {
            console.error('❌ 인증 코드 확인 실패:', error);
            Alert.alert('오류', error.message || '인증 코드가 올바르지 않습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 3단계: 비밀번호 재설정
    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('오류', '모든 항목을 입력해주세요.');
            return;
        }

        if (newPassword.length < 8 || newPassword.length > 16) {
            Alert.alert('오류', '비밀번호는 8~16자여야 합니다.');
            return;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
        if (!passwordRegex.test(newPassword)) {
            Alert.alert('오류', '비밀번호는 영문과 특수문자(!@#$%^&*)를 포함한 8~16자여야 합니다.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        try {
            // ✅ 코드를 문자열로 확실히 변환
            const codeString = String(verificationCode).trim();
            
            console.log('🔒 비밀번호 재설정 요청:', {
                email,
                code: codeString,
                newPassword: '***',
                confirmPassword: '***',
            });
            
            await authService.resetPassword({
                email,
                code: codeString,
                newPassword,
                confirmPassword,  // ✅ confirmPassword 추가
            });
            
            Alert.alert(
                '✅ 비밀번호 변경 완료',
                '비밀번호가 성공적으로 변경되었습니다.\n새 비밀번호로 로그인해주세요.',
                [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]
            );
        } catch (error: any) {
            console.error('❌ 비밀번호 변경 실패:', error);
            Alert.alert('오류', error.message || '비밀번호 변경에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (step === 'email') {
            return (
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>이메일 인증</Text>
                    <Text style={styles.description}>
                        가입하신 이메일을 입력하면 인증 코드를 발송해드립니다.
                    </Text>
                    
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="이메일 주소"
                            placeholderTextColor={Colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    <PrimaryButton 
                        title={loading ? '발송 중...' : '인증 코드 발송'}
                        onPress={handleSendVerification}
                        style={styles.submitBtn}
                        disabled={loading}
                    />
                </View>
            );
        }

        if (step === 'verify') {
            return (
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>인증 코드 확인</Text>
                    <Text style={styles.description}>
                        {email}로 발송된 인증 코드를 입력해주세요.
                    </Text>
                    
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="인증 코드 (6자리)"
                            placeholderTextColor={Colors.textSecondary}
                            value={verificationCode}
                            onChangeText={(text) => {
                                // ✅ 숫자만 입력 허용
                                const numbersOnly = text.replace(/\D/g, '');
                                setVerificationCode(numbersOnly);
                            }}
                            keyboardType="number-pad"
                            maxLength={6}
                            editable={!loading}
                        />
                    </View>

                    <PrimaryButton 
                        title={loading ? '확인 중...' : '인증 코드 확인'}
                        onPress={handleVerifyCode}
                        style={styles.submitBtn}
                        disabled={loading}
                    />

                    <TouchableOpacity 
                        style={styles.resendBtn}
                        onPress={handleSendVerification}
                        disabled={loading}
                    >
                        <Text style={styles.resendText}>인증 코드 재발송</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (step === 'password') {
            return (
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>새 비밀번호 설정</Text>
                    <Text style={styles.description}>
                        새로운 비밀번호를 입력해주세요.
                    </Text>
                    
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="새 비밀번호 (영문+특수문자, 8~16자)"
                            placeholderTextColor={Colors.textSecondary}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            editable={!loading}
                        />
                        
                        <TextInput
                            style={styles.input}
                            placeholder="새 비밀번호 확인"
                            placeholderTextColor={Colors.textSecondary}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            editable={!loading}
                        />
                    </View>

                    <PrimaryButton 
                        title={loading ? '변경 중...' : '비밀번호 변경 완료'}
                        onPress={handleResetPassword}
                        style={styles.submitBtn}
                        disabled={loading}
                    />

                    <Text style={styles.infoText}>
                        비밀번호는 영문과 특수문자(!@#$%^&*)를 포함한 8~16자여야 합니다.
                    </Text>
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <FontAwesome5 name="arrow-left" size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>비밀번호 변경</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* 진행 단계 표시 */}
            <View style={styles.stepIndicator}>
                <View style={styles.stepItem}>
                    <View style={[styles.stepCircle, step === 'email' && styles.stepCircleActive]}>
                        <Text style={[styles.stepNumber, step === 'email' && styles.stepNumberActive]}>1</Text>
                    </View>
                    <Text style={styles.stepLabel}>이메일</Text>
                </View>
                <View style={styles.stepLine} />
                <View style={styles.stepItem}>
                    <View style={[styles.stepCircle, step === 'verify' && styles.stepCircleActive, verified && styles.stepCircleComplete]}>
                        <Text style={[styles.stepNumber, step === 'verify' && styles.stepNumberActive, verified && styles.stepNumberActive]}>2</Text>
                    </View>
                    <Text style={styles.stepLabel}>인증</Text>
                </View>
                <View style={styles.stepLine} />
                <View style={styles.stepItem}>
                    <View style={[styles.stepCircle, step === 'password' && styles.stepCircleActive]}>
                        <Text style={[styles.stepNumber, step === 'password' && styles.stepNumberActive]}>3</Text>
                    </View>
                    <Text style={styles.stepLabel}>비밀번호</Text>
                </View>
            </View>

            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {renderContent()}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.bgDark,
        borderBottomWidth: 1,
        borderBottomColor: '#3C3C5C',
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(60, 60, 92, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(60, 60, 92, 0.8)',
    },
    stepCircleActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    stepCircleComplete: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    stepNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    stepNumberActive: {
        color: Colors.textPrimary,
    },
    stepLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 5,
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: 'rgba(60, 60, 92, 0.5)',
        marginHorizontal: 5,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: Colors.bgCard,
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 8,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 20,
        lineHeight: 20,
    },
    inputContainer: {
        gap: 15,
    },
    input: {
        backgroundColor: 'rgba(45, 45, 69, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(60, 60, 92, 0.8)',
        borderRadius: 16,
        padding: 18,
        fontSize: 15,
        color: Colors.textPrimary,
    },
    submitBtn: {
        marginTop: 20,
    },
    resendBtn: {
        marginTop: 15,
        alignItems: 'center',
    },
    resendText: {
        fontSize: 14,
        color: Colors.accentPrimary,
        textDecorationLine: 'underline',
    },
    infoText: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 15,
        lineHeight: 18,
    },
});

export default PasswordChangeScreen;