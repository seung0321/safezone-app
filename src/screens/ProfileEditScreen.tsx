// src/screens/ProfileEditScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import { useProfile } from '../context/ProfileContext';

interface ProfileEditScreenProps {
    navigation: any;
}

const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ navigation }) => {
    const { profileData, updateProfile, loading } = useProfile();

    // ✅ 수정 가능한 필드만 state로 관리 (닉네임, 핸드폰번호)
    const [nickname, setNickname] = useState(profileData.nickname || '');
    const [phone, setPhone] = useState(profileData.phone || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setNickname(profileData.nickname || '');
        setPhone(profileData.phone || '');
    }, [profileData]);

    // ✅ 전화번호 입력 핸들러 - 숫자만 허용
    const handlePhoneChange = (text: string) => {
        const numbersOnly = text.replace(/\D/g, '');
        setPhone(numbersOnly);
    };

    const handleSave = async () => {
        // 닉네임 검증
        if (!nickname.trim()) {
            Alert.alert('오류', '닉네임을 입력해주세요.');
            return;
        }

        if (nickname.trim().length > 15) {
            Alert.alert('오류', '닉네임은 15자 이내로 입력해주세요.');
            return;
        }

        // 전화번호 검증
        const cleanedPhone = phone.replace(/\D/g, '');
        if (cleanedPhone.length < 10 || cleanedPhone.length > 11) {
            Alert.alert('오류', '휴대폰 번호는 10-11자리 숫자여야 합니다.');
            return;
        }

        // ✅ 닉네임과 전화번호만 업데이트
        const updatedProfile = {
            nickname: nickname.trim(),
            phone: cleanedPhone,
        };

        console.log('프로필 업데이트:', updatedProfile);
        
        setSaving(true);
        try {
            await updateProfile(updatedProfile);
            
            Alert.alert(
                '✅',
                '프로필이 성공적으로 업데이트되었습니다.',
                [
                    {
                        text: '확인',
                        onPress: () => {
                            navigation.goBack();
                        }
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert('오류', error.message || '프로필 수정 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleProfileImageChange = () => {
        Alert.alert(
            '프로필 사진 변경',
            '프로필 사진을 변경하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { text: '앨범에서 선택', onPress: () => alert('앨범 선택 기능 구현 예정') },
                { text: '카메라로 촬영', onPress: () => alert('카메라 촬영 기능 구현 예정') }
            ]
        );
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
                <Text style={styles.headerTitle}>프로필 수정</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* 프로필 이미지 */}
                <View style={styles.profileImageContainer}>
                    <View style={styles.profileAvatar}>
                        <FontAwesome5 name="user-circle" size={80} color="white" />
                    </View>
                    <TouchableOpacity 
                        style={styles.changeImageBtn}
                        onPress={handleProfileImageChange}
                    >
                        <FontAwesome5 name="camera" size={16} color="white" />
                    </TouchableOpacity>
                </View>

                {/* ✅ 수정 불가능한 정보 (읽기 전용) */}
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>기본 정보 (수정 불가)</Text>
                    
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>이름</Text>
                            <View style={[styles.input, styles.disabledInput]}>
                                <Text style={styles.disabledText}>{profileData.name}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>이메일</Text>
                            <View style={[styles.input, styles.disabledInput]}>
                                <Text style={styles.disabledText}>{profileData.email}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ✅ 수정 가능한 정보 */}
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>수정 가능한 정보</Text>
                    
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>닉네임</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="닉네임"
                                placeholderTextColor={Colors.textSecondary}
                                value={nickname}
                                onChangeText={setNickname}
                                maxLength={15}
                            />
                        </View>
                        
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>휴대폰 번호</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="휴대폰 번호 (숫자만 10-11자리)"
                                placeholderTextColor={Colors.textSecondary}
                                value={phone}
                                onChangeText={handlePhoneChange}
                                keyboardType="number-pad"
                                maxLength={11}
                            />
                            {phone.length > 0 && phone.length < 10 && (
                                <Text style={styles.helperText}>최소 10자리를 입력해주세요</Text>
                            )}
                        </View>
                    </View>
                </View>

                <PrimaryButton 
                    title={saving ? "저장 중..." : "저장"} 
                    onPress={handleSave}
                    style={styles.submitBtn}
                    disabled={saving || loading}
                />

                <Text style={styles.infoText}>
                    이름과 이메일은 수정할 수 없습니다.{'\n'}
                    변경이 필요한 경우 고객센터에 문의해주세요.
                </Text>
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
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 30,
        position: 'relative',
    },
    profileAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.accentPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.accentPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    changeImageBtn: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.accentSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.bgDark,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
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
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 15,
    },
    inputContainer: {
        gap: 20,
    },
    inputWrapper: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        paddingLeft: 5,
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
    disabledInput: {
        backgroundColor: 'rgba(45, 45, 69, 0.3)',
        justifyContent: 'center',
    },
    disabledText: {
        fontSize: 15,
        color: Colors.textSecondary,
    },
    helperText: {
        fontSize: 12,
        color: '#FF6B6B',
        marginTop: 5,
        marginLeft: 5,
    },
    submitBtn: {
        marginTop: 20,
    },
    infoText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 20,
    },
});

export default ProfileEditScreen;