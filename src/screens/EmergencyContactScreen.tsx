// src/screens/EmergencyContactScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

interface Contact {
    id: number;
    name: string;
    phone: string;
}

interface EmergencyContactScreenProps {
    navigation: any;
}

const EmergencyContactScreen: React.FC<EmergencyContactScreenProps> = ({ navigation }) => {
    const [contacts, setContacts] = useState<Contact[]>([
        { id: 1, name: '엄마', phone: '01012345678' },
        { id: 2, name: '남자친구', phone: '01098765432' }
    ]);

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '';
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
        if (match) {
            return match[1] + '-' + match[2] + '-' + match[3];
        }
        return phone;
    };

    const deleteContact = (id: number) => {
        Alert.alert(
            '연락처 삭제',
            '정말로 이 비상 연락처를 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => {
                        setContacts(contacts.filter(c => c.id !== id));
                        Alert.alert('✅', '연락처가 삭제되었습니다.');
                    }
                }
            ]
        );
    };

    const handleAddContact = () => {
        navigation.navigate('AddEditContact', { 
            mode: 'add',
            onSave: (newContact: Contact) => {
                setContacts([...contacts, newContact]);
            }
        });
    };

    const handleEditContact = (contact: Contact) => {
        navigation.navigate('AddEditContact', {
            mode: 'edit',
            contact: contact,
            onSave: (updatedContact: Contact) => {
                setContacts(contacts.map(c => 
                    c.id === updatedContact.id ? updatedContact : c
                ));
            }
        });
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
                <Text style={styles.headerTitle}>비상 연락처 관리</Text>
                <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={handleAddContact}
                >
                    <FontAwesome5 name="plus" size={18} color={Colors.accentPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionHeader}>등록된 연락처 (SOS 호출 대상)</Text>
                
                {contacts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="info-circle" size={60} color={Colors.textSecondary} />
                        <Text style={styles.emptyStateText}>
                            긴급 호출(SOS) 시 등록된 모든 연락처로{'\n'}
                            사용자의 위치 정보가 전송됩니다.
                        </Text>
                    </View>
                ) : (
                    contacts.map(contact => (
                        <TouchableOpacity
                            key={contact.id}
                            style={styles.contactItem}
                            onPress={() => handleEditContact(contact)}
                        >
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactName}>{contact.name}</Text>
                                <Text style={styles.contactPhone}>
                                    {formatPhoneNumber(contact.phone)}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => deleteContact(contact.id)}
                            >
                                <FontAwesome5 name="trash" size={14} color="white" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                )}

                <View style={styles.infoBox}>
                    <FontAwesome5 name="info-circle" size={16} color={Colors.accentPrimary} />
                    <Text style={styles.infoText}>
                        긴급 상황 시 등록된 모든 연락처로 자동으로 위치 정보와 함께 알림이 전송됩니다.
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
    addBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(106, 137, 255, 0.15)',
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
    sectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 15,
        paddingLeft: 10,
        borderLeftWidth: 3,
        borderLeftColor: Colors.accentPrimary,
    },
    contactItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        borderRadius: 14,
        backgroundColor: Colors.bgCard,
        borderLeftWidth: 4,
        borderLeftColor: Colors.accentSecondary,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    contactPhone: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    deleteBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    emptyState: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 20,
        textAlign: 'center',
        lineHeight: 22,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(106, 137, 255, 0.1)',
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
});

export default EmergencyContactScreen;