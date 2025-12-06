// src/screens/AddEditContactScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import { RootStackParamList } from '../../App';

interface Contact {
    id: number;
    name: string;
    phone: string;
}

// Props 타입을 StackScreenProps로 정의
type AddEditContactScreenProps = StackScreenProps<RootStackParamList, 'AddEditContact'>;

const AddEditContactScreen: React.FC<AddEditContactScreenProps> = ({ navigation, route }) => {
    const { mode, contact, onSave } = route.params;
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (mode === 'edit' && contact) {
            setName(contact.name);
            setPhone(contact.phone);
        }
    }, [mode, contact]);

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('오류', '이름을 입력해주세요.');
            return;
        }

        const cleanedPhone = phone.replace(/\D/g, '');
        if (cleanedPhone.length < 10) {
            Alert.alert('오류', '유효한 휴대폰 번호를 입력해주세요.');
            return;
        }

        const savedContact: Contact = {
            id: mode === 'edit' && contact ? contact.id : Date.now(),
            name: name.trim(),
            phone: cleanedPhone
        };

        onSave(savedContact);
        
        Alert.alert(
            '✅',
            mode === 'add' ? '새 연락처가 추가되었습니다.' : '연락처가 수정되었습니다.',
            [
                {
                    text: '확인',
                    onPress: () => navigation.goBack()
                }
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
                <Text style={styles.headerTitle}>
                    {mode === 'add' ? '연락처 추가' : '연락처 수정'}
                </Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>연락처 정보 입력</Text>
                    
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="관계 또는 이름 (예: 엄마, 김철수)"
                            placeholderTextColor={Colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                            maxLength={20}
                        />
                        
                        <TextInput
                            style={styles.input}
                            placeholder="휴대폰 번호 (하이픈 없이)"
                            placeholderTextColor={Colors.textSecondary}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            maxLength={11}
                        />
                    </View>
                </View>

                <PrimaryButton 
                    title={mode === 'add' ? '추가' : '저장'} 
                    onPress={handleSave}
                    style={styles.submitBtn}
                />

                <Text style={styles.infoText}>
                    등록된 연락처는 긴급 호출 시에만 사용됩니다.
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
    infoText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 20,
    },
});

export default AddEditContactScreen;