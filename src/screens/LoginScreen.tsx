// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import { RootStackParamList } from '../../App';
import authService from '../api/authService';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.login({
                email: email.trim(),
                password,
            });

            console.log('✅ 로그인 성공:', response);
            
            // 메인 화면으로 이동
            navigation.replace('Main');
        } catch (error: any) {
            console.error('❌ 로그인 실패:', error);
            
            if (error.message === 'UNAUTHORIZED') {
                Alert.alert('로그인 실패', '이메일 또는 비밀번호가 올바르지 않습니다.');
            } else {
                Alert.alert('로그인 실패', error.message || '로그인 중 문제가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#3C365C', Colors.bgDark]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.content}>
                <View style={styles.card}>
                    {/* 로고 */}
                    <Text style={styles.logo}>🛡️</Text>
                    
                    {/* 타이틀 */}
                    <Text style={styles.title}>SafeRoute 로그인</Text>
                    <Text style={styles.subtitle}>안전한 귀갓길을 지금 바로 시작하세요.</Text>

                    {/* 이메일 입력 */}
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

                    {/* 비밀번호 입력 */}
                    <TextInput
                        style={styles.input}
                        placeholder="비밀번호"
                        placeholderTextColor={Colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!loading}
                    />

                    {/* 로그인 버튼 */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <PrimaryButton 
                            title="로그인" 
                            onPress={handleLogin} 
                            style={styles.loginButton} 
                        />
                    )}

                    {/* 회원가입 버튼 */}
                    <TouchableOpacity 
                        style={styles.signupButton}
                        onPress={() => navigation.navigate('SignupEmailEntry')}
                        disabled={loading}
                    >
                        <Text style={styles.signupButtonText}>회원가입</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: Colors.bgCard,
        borderRadius: 20,
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
    },
    logo: {
        fontSize: 45,
        textAlign: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 18,
        lineHeight: 16,
    },
    input: {
        backgroundColor: '#2D2D45',
        borderWidth: 1,
        borderColor: '#3C3C5C',
        borderRadius: 12,
        padding: 13,
        fontSize: 15,
        color: Colors.textPrimary,
        marginBottom: 10,
    },
    loginButton: {
        marginTop: 5,
        marginBottom: 10,
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    signupButton: {
        padding: 11,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.accentSecondary,
        backgroundColor: 'transparent',
    },
    signupButtonText: {
        color: Colors.accentSecondary,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
});

export default LoginScreen;