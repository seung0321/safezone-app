// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Colors from '../constants/Colors';
import { useProfile } from '../context/ProfileContext';
import { RootStackParamList } from '../../App';
import userService from '../api/userService';
import authService from '../api/authService';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

interface ProfileScreenProps {
    navigation: ProfileScreenNavigationProp;
}

interface SettingItemProps {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    isDanger?: boolean;
    showChevron?: boolean;
    rightElement?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
    icon, 
    title, 
    subtitle,
    onPress, 
    isDanger = false,
    showChevron = true,
    rightElement
}) => {
    return (
        <TouchableOpacity 
            style={[styles.settingItem, isDanger && styles.settingItemDanger]} 
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress && !rightElement}
        >
            <View style={styles.settingItemContent}>
                <View style={[
                    styles.iconCircle,
                    isDanger && styles.iconCircleDanger
                ]}>
                    <FontAwesome5 
                        name={icon} 
                        size={18} 
                        color={isDanger ? Colors.danger : Colors.accentPrimary} 
                    />
                </View>
                <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingItemText, isDanger && styles.settingItemTextDanger]}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={styles.settingItemSubtitle}>{subtitle}</Text>
                    )}
                </View>
            </View>
            {rightElement || (showChevron && (
                <FontAwesome5 name="chevron-right" size={16} color={Colors.textSecondary} />
            ))}
        </TouchableOpacity>
    );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    // ✅ 수정됨: setProfileData 제거, refreshProfile 추가
    const { profileData, refreshProfile } = useProfile();
    const [loading, setLoading] = useState(false);

    // 화면 로드 시 프로필 정보 가져오기
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            // ✅ 수정됨: 직접 setProfileData를 호출하는 대신 Context의 refreshProfile 사용
            // refreshProfile 내부에서 userService.getMyProfile()을 호출하고 상태를 업데이트함
            await refreshProfile();
        } catch (error: any) {
            console.error('프로필 로드 실패:', error);
            // 토큰이 유효하지 않으면 로그인 화면으로
            if (error.message === 'UNAUTHORIZED') {
                Alert.alert('세션 만료', '다시 로그인해주세요.', [
                    {
                        text: '확인',
                        onPress: () => navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        }),
                    },
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = () => {
        navigation.navigate('PasswordChange');
    };

    const handleEmergencyContact = () => {
        navigation.navigate('EmergencyContact');
    };

    const handleProfileEdit = () => {
        navigation.navigate('ProfileEdit');
    };

    const handleNotificationSettings = () => {
        navigation.navigate('NotificationSettings');
    };

    const handleTerms = () => {
        Alert.alert('이용약관', 'SafeRoute 서비스 이용약관을 읽고 있습니다.');
    };

    const handlePrivacy = () => {
        Alert.alert('개인정보 처리방침', 'SafeRoute 개인정보 처리방침을 읽고 있습니다.');
    };

    const handleAppInfo = () => {
        Alert.alert(
            'SafeRoute',
            'AI 기반 안심귀가 서비스\n\n버전: 2.3.0\n개발: SafeRoute Team\n\n© 2025 SafeRoute. All rights reserved.',
            [{ text: '확인' }]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            '로그아웃',
            '정말 로그아웃 하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { 
                    text: '로그아웃', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await authService.logout();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error('로그아웃 실패:', error);
                            // 실패해도 로그인 화면으로 이동
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        }
                    }
                }
            ]
        );
    };

    const handleAccountDeletion = () => {
        navigation.navigate('AccountDeletion');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* App Header */}
            <View style={styles.appHeader}>
                <Text style={styles.pageTitle}>👤 내 정보</Text>
                <Text style={styles.pageSubtitle}>계정 및 설정 관리</Text>
            </View>

            <ScrollView 
                contentContainerStyle={styles.mainContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>프로필 정보를 불러오는 중...</Text>
                    </View>
                ) : (
                    <>
                        {/* 프로필 카드 */}
                        <View style={styles.profileCard}>
                    <View style={styles.profileAvatar}>
                        <FontAwesome5 name="user-circle" size={50} color="white" />
                    </View>
                    <Text style={styles.profileName}>{profileData.name}</Text>
                    <Text style={styles.profileEmail}>{profileData.email}</Text>
                    <TouchableOpacity 
                        style={styles.editProfileBtn}
                        onPress={handleProfileEdit}
                    >
                        <FontAwesome5 name="edit" size={12} color={Colors.accentPrimary} />
                        <Text style={styles.editProfileText}>프로필 수정</Text>
                    </TouchableOpacity>
                </View>

                {/* 계정 설정 */}
                <Text style={styles.sectionHeader}>계정 설정</Text>
                <View style={styles.settingGroup}>
                    <SettingItem 
                        icon="lock" 
                        title="비밀번호 변경" 
                        subtitle="보안을 위해 주기적으로 변경하세요"
                        onPress={handlePasswordChange} 
                    />
                    <SettingItem 
                        icon="users" 
                        title="비상 연락처 관리" 
                        subtitle="SOS 호출 시 알림 받을 연락처"
                        onPress={handleEmergencyContact} 
                    />
                </View>

                {/* 알림 설정 */}
                <Text style={styles.sectionHeader}>알림 설정</Text>
                <View style={styles.settingGroup}>
                    <SettingItem 
                        icon="bell" 
                        title="알림 설정" 
                        subtitle="푸시 알림 관리 및 설정"
                        onPress={handleNotificationSettings} 
                    />
                </View>

                {/* 앱 정보 */}
                <Text style={styles.sectionHeader}>앱 정보</Text>
                <View style={styles.settingGroup}>
                    <SettingItem 
                        icon="book" 
                        title="서비스 이용 약관" 
                        onPress={handleTerms} 
                    />
                    <SettingItem 
                        icon="shield-alt" 
                        title="개인정보 처리방침" 
                        onPress={handlePrivacy} 
                    />
                    <SettingItem 
                        icon="info-circle" 
                        title="앱 정보" 
                        subtitle="버전 2.3.0"
                        onPress={handleAppInfo} 
                    />
                </View>

                {/* 로그아웃 */}
                <View style={styles.settingGroup}>
                    <SettingItem 
                        icon="sign-out-alt" 
                        title="로그아웃" 
                        onPress={handleLogout}
                        isDanger={true}
                    />
                </View>

                {/* 회원 탈퇴 */}
                <TouchableOpacity 
                    style={styles.accountDeletionButton}
                    onPress={handleAccountDeletion}
                >
                    <FontAwesome5 name="user-times" size={14} color={Colors.danger} />
                    <Text style={styles.accountDeletionText}>회원 탈퇴</Text>
                </TouchableOpacity>

                {/* 하단 여백 */}
                <View style={{ height: 40 }} />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgDark,
    },
    appHeader: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        backgroundColor: Colors.bgDark,
    },
    pageTitle: {
        fontSize: 35,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    pageSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    mainContent: {
        paddingHorizontal: 20,
        paddingTop: 0,
        paddingBottom: 100,
    },
    profileCard: {
        backgroundColor: Colors.bgCard,
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    profileAvatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.accentPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: Colors.accentPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 5,
    },
    profileEmail: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 15,
    },
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(106, 137, 255, 0.15)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.accentPrimary,
    },
    editProfileText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.accentPrimary,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
        marginTop: 30,
        paddingLeft: 10,
        borderLeftWidth: 3,
        borderLeftColor: Colors.accentPrimary,
    },
    settingGroup: {
        backgroundColor: Colors.bgCard,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    settingItemDanger: {
        borderLeftWidth: 3,
        borderLeftColor: Colors.danger,
    },
    settingItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        flex: 1,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(106, 137, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircleDanger: {
        backgroundColor: 'rgba(229, 57, 53, 0.15)',
    },
    settingTextContainer: {
        flex: 1,
    },
    settingItemText: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    settingItemSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    settingItemTextDanger: {
        color: Colors.danger,
        fontWeight: '600',
    },
    accountDeletionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginTop: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.3)',
    },
    accountDeletionText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.danger,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: Colors.textSecondary,
    },
});

export default ProfileScreen;