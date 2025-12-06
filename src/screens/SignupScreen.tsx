// src/screens/SignupScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import authService from '../api/authService';

interface SignupScreenProps {
    navigation: any;
    route: any;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation, route }) => {
    const { email: emailFromRoute, verified } = route.params || {};
    
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState(emailFromRoute || '');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [allTerms, setAllTerms] = useState(false);
    const [serviceTerms, setServiceTerms] = useState(false);
    const [privacyTerms, setPrivacyTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAllTermsToggle = () => {
        const newValue = !allTerms;
        setAllTerms(newValue);
        setServiceTerms(newValue);
        setPrivacyTerms(newValue);
    };

    // ✅ 전화번호 입력 핸들러 - 숫자만 허용
    const handlePhoneChange = (text: string) => {
        // 모든 숫자가 아닌 문자 제거
        const cleaned = text.replace(/\D/g, '');
        setPhone(cleaned);
    };

    const handleSignup = async () => {
        // ✅ 디버깅: 실제 전화번호 값 확인
        console.log('=== 회원가입 시작 ===');
        console.log('📱 phone 원본:', phone);
        console.log('📱 phone length:', phone.length);
        console.log('📱 phone type:', typeof phone);
        
        // 기본 검증
        if (!name.trim() || !nickname.trim() || !email.trim() || !phone || !password || !passwordConfirm) {
            Alert.alert('오류', '모든 항목을 입력해주세요.');
            return;
        }

        if (password !== passwordConfirm) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }

        if (password.length < 8 || password.length > 16) {
            Alert.alert('오류', '비밀번호는 8~16자여야 합니다.');
            return;
        }

        // 비밀번호 형식 검증
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
        if (!passwordRegex.test(password)) {
            Alert.alert('오류', '비밀번호는 영문과 특수문자(!@#$%^&*)를 포함한 8~16자여야 합니다.');
            return;
        }

        // ✅ 전화번호 형식 검증 (10-11자리 숫자)
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            Alert.alert('오류', '휴대폰 번호는 10-11자리 숫자여야 합니다.');
            return;
        }

        if (!serviceTerms || !privacyTerms) {
            Alert.alert('오류', '필수 약관에 동의해주세요.');
            return;
        }

        if (!verified) {
            Alert.alert('오류', '이메일 인증을 완료해주세요.');
            return;
        }

        setLoading(true);

        try {
            // ✅ 데이터 정제 - 확실하게 문자열로 변환
            const registerData = {
                name: String(name).trim(),
                nickname: String(nickname).trim(),
                email: String(email).trim(),
                phone: String(cleanPhone), // 이미 숫자만 추출한 상태
                password: String(password),
                confirmPassword: String(passwordConfirm),
            };
            
            console.log('📤 전송할 데이터:', JSON.stringify(registerData, null, 2));

            // 회원가입 API 호출
            const response = await authService.register(registerData);

            console.log('✅ 회원가입 성공:', response);

            Alert.alert(
                '회원가입 완료',
                '회원가입이 완료되었습니다!\n로그인해주세요.',
                [
                    {
                        text: '확인',
                        onPress: () => navigation.replace('Login'),
                    },
                ]
            );
        } catch (error: any) {
            console.error('❌ 회원가입 실패:', error);
            Alert.alert('회원가입 실패', error.message || '회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const showTerms = (type: string) => {
        if (type === 'service') {
            Alert.alert('서비스 이용약관', 'SafeRoute 서비스 이용약관\n\n제1조 (목적)...');
        } else if (type === 'privacy') {
            Alert.alert('개인정보 처리방침', 'SafeRoute 개인정보 처리방침\n\n1. 수집하는 개인정보의 항목...');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <FontAwesome5 name="arrow-left" size={20} color="#E0E0E0" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>회원가입</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* 입력 필드 */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="이름"
                        placeholderTextColor={Colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                        editable={!loading}
                        autoCapitalize="words"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="닉네임"
                        placeholderTextColor={Colors.textSecondary}
                        value={nickname}
                        onChangeText={setNickname}
                        editable={!loading}
                    />
                    <TextInput
                        style={[styles.input, verified && styles.inputDisabled]}
                        placeholder="이메일 주소"
                        placeholderTextColor={Colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!verified && !loading}
                    />
                    {verified && (
                        <View style={styles.verifiedBadge}>
                            <FontAwesome5 name="check-circle" size={14} color="#4CAF50" />
                            <Text style={styles.verifiedText}>이메일 인증 완료</Text>
                        </View>
                    )}
                    <TextInput
                        style={styles.input}
                        placeholder="휴대폰 번호 (숫자만 10-11자리)"
                        placeholderTextColor={Colors.textSecondary}
                        value={phone}
                        onChangeText={handlePhoneChange}
                        keyboardType="number-pad"
                        maxLength={11}
                        editable={!loading}
                    />
                    {phone.length > 0 && phone.length < 10 && (
                        <Text style={styles.helperText}>최소 10자리를 입력해주세요</Text>
                    )}
                    <TextInput
                        style={styles.input}
                        placeholder="비밀번호 (영문+특수문자, 8~16자)"
                        placeholderTextColor={Colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!loading}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="비밀번호 확인"
                        placeholderTextColor={Colors.textSecondary}
                        value={passwordConfirm}
                        onChangeText={setPasswordConfirm}
                        secureTextEntry
                        editable={!loading}
                        autoCapitalize="none"
                    />
                </View>

                {/* 약관 동의 */}
                <View style={styles.termsSection}>
                    <TouchableOpacity
                        style={styles.termsItemAll}
                        onPress={handleAllTermsToggle}
                        disabled={loading}
                    >
                        <Text style={styles.termsTextBold}>전체 약관 동의</Text>
                        <View style={[styles.checkbox, allTerms && styles.checkboxActive]}>
                            {allTerms && <FontAwesome5 name="check" size={14} color="white" />}
                        </View>
                    </TouchableOpacity>

                    <View style={styles.termsItem}>
                        <View style={styles.termsLeft}>
                            <TouchableOpacity
                                style={[styles.checkbox, serviceTerms && styles.checkboxActive]}
                                onPress={() => setServiceTerms(!serviceTerms)}
                                disabled={loading}
                            >
                                {serviceTerms && <FontAwesome5 name="check" size={14} color="white" />}
                            </TouchableOpacity>
                            <Text style={styles.termsText}>(필수) 서비스 이용약관</Text>
                        </View>
                        <TouchableOpacity onPress={() => showTerms('service')} disabled={loading}>
                            <Text style={styles.termsLink}>보기</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.termsItem}>
                        <View style={styles.termsLeft}>
                            <TouchableOpacity
                                style={[styles.checkbox, privacyTerms && styles.checkboxActive]}
                                onPress={() => setPrivacyTerms(!privacyTerms)}
                                disabled={loading}
                            >
                                {privacyTerms && <FontAwesome5 name="check" size={14} color="white" />}
                            </TouchableOpacity>
                            <Text style={styles.termsText}>(필수) 개인정보 수집 및 이용</Text>
                        </View>
                        <TouchableOpacity onPress={() => showTerms('privacy')} disabled={loading}>
                            <Text style={styles.termsLink}>보기</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 가입 완료 버튼 */}
                <TouchableOpacity
                    style={[styles.signupButton, (!verified || loading) && styles.signupButtonDisabled]}
                    onPress={handleSignup}
                    disabled={!verified || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.textPrimary} />
                    ) : (
                        <Text style={styles.signupButtonText}>회원가입 완료</Text>
                    )}
                </TouchableOpacity>
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
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    content: {
        paddingHorizontal: 30,
        paddingTop: 30,
        paddingBottom: 40,
    },
    inputContainer: {
        gap: 15,
        marginBottom: 40,
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
    inputDisabled: {
        opacity: 0.6,
        backgroundColor: 'rgba(45, 45, 69, 0.3)',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        borderRadius: 12,
        marginTop: -10,
        marginBottom: 5,
    },
    verifiedText: {
        fontSize: 13,
        color: '#4CAF50',
        fontWeight: '600',
    },
    helperText: {
        fontSize: 12,
        color: '#FF6B6B',
        marginTop: -10,
        marginLeft: 5,
    },
    termsSection: {
        marginBottom: 30,
    },
    termsItemAll: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(60, 60, 92, 0.5)',
    },
    termsTextBold: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    termsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    termsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    termsText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    termsLink: {
        fontSize: 14,
        color: Colors.accentPrimary,
        textDecorationLine: 'underline',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(60, 60, 92, 0.8)',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: Colors.accentPrimary,
        borderColor: Colors.accentPrimary,
    },
    signupButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    signupButtonDisabled: {
        backgroundColor: Colors.bgLight,
        opacity: 0.5,
    },
    signupButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
});

export default SignupScreen;