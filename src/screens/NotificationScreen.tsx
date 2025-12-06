// src/screens/NotificationScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

interface Notification {
    id: number;
    type: 'danger' | 'safety' | 'info';
    title: string;
    body: string;
    time: string;
}

const NotificationScreen: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([
        { 
            id: 1, 
            type: 'danger', 
            title: '위험 알림: 조명 취약 구간', 
            body: '현재 경로에 위험 요소가 감지되었습니다. 200m 전방에 조명이 부족한 구간이 있으니 주의하세요.', 
            time: '5분 전' 
        },
        { 
            id: 2, 
            type: 'safety', 
            title: '경로 변경 추천', 
            body: '실시간 유동인구 증가로 안전 경로가 업데이트 되었습니다. 새로운 경로로 변경할까요?', 
            time: '1시간 전' 
        },
        { 
            id: 3, 
            type: 'danger', 
            title: '커뮤니티 위험 정보', 
            body: "'신촌역 근처 공사' 게시글이 등록되었습니다. 해당 지역 이용 시 주의하세요.", 
            time: '어제' 
        },
        { 
            id: 4, 
            type: 'safety', 
            title: '안전 가이드 업데이트', 
            body: '밤 늦게 귀가할 때 안전을 위한 팁이 업데이트되었습니다.', 
            time: '2일 전' 
        },
    ]);

    const deleteNotification = (id: number) => {
        Alert.alert(
            '알림 삭제',
            '이 알림을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => {
                        setNotifications(notifications.filter(notif => notif.id !== id));
                    }
                }
            ]
        );
    };

    const deleteAllNotifications = () => {
        if (notifications.length === 0) return;
        
        Alert.alert(
            '전체 삭제',
            '모든 알림을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '전체 삭제',
                    style: 'destructive',
                    onPress: () => {
                        setNotifications([]);
                    }
                }
            ]
        );
    };

    const getIconName = (type: string) => {
        if (type === 'danger') return 'exclamation-triangle';
        if (type === 'safety') return 'shield-alt';
        return 'bell';
    };

    const getIconColor = (type: string) => {
        if (type === 'danger') return Colors.danger;
        if (type === 'safety') return Colors.success;
        return Colors.accentPrimary;
    };

    const getBorderColor = (type: string) => {
        if (type === 'danger') return Colors.danger;
        if (type === 'safety') return Colors.success;
        return Colors.accentPrimary;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* App Header */}
            <View style={styles.appHeader}>
                <View>
                    <Text style={styles.pageTitle}>🔔 알림센터</Text>
                    <Text style={styles.pageSubtitle}>
                        {notifications.length > 0 
                            ? `새로운 알림 ${notifications.length}개` 
                            : '새로운 알림이 없습니다'
                        }
                    </Text>
                </View>
                {notifications.length > 0 && (
                    <TouchableOpacity 
                        style={styles.deleteAllBtn}
                        onPress={deleteAllNotifications}
                    >
                        <Text style={styles.deleteAllText}>전체 삭제</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView 
                contentContainerStyle={styles.mainContent}
                showsVerticalScrollIndicator={false}
            >
                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="bell-slash" size={60} color={Colors.textSecondary} />
                        <Text style={styles.emptyStateText}>새로운 알림이 없습니다.</Text>
                        <Text style={styles.emptyStateSubtext}>
                            안전 알림과 커뮤니티 소식을{'\n'}여기에서 확인하실 수 있습니다.
                        </Text>
                    </View>
                ) : (
                    notifications.map(notif => (
                        <View 
                            key={notif.id} 
                            style={[
                                styles.notificationItem,
                                { borderLeftColor: getBorderColor(notif.type) }
                            ]}
                        >
                            <View style={styles.notificationContent}>
                                <View style={styles.iconContainer}>
                                    <FontAwesome5 
                                        name={getIconName(notif.type)} 
                                        size={22} 
                                        color={getIconColor(notif.type)} 
                                    />
                                </View>
                                <View style={styles.notificationTextContainer}>
                                    <Text style={styles.notificationTitle}>{notif.title}</Text>
                                    <Text style={styles.notificationBody}>{notif.body}</Text>
                                    <Text style={styles.notificationTime}>{notif.time}</Text>
                                </View>
                            </View>
                            <TouchableOpacity 
                                style={styles.deleteButton}
                                onPress={() => deleteNotification(notif.id)}
                            >
                                <FontAwesome5 name="times" size={14} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
    deleteAllBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(229, 57, 53, 0.15)',
        borderWidth: 1,
        borderColor: Colors.danger,
    },
    deleteAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.danger,
    },
    mainContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    notificationItem: {
        backgroundColor: Colors.bgCard,
        padding: 15,
        borderRadius: 14,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    notificationContent: {
        flexDirection: 'row',
        flex: 1,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(106, 137, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationTextContainer: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 6,
        lineHeight: 22,
    },
    notificationBody: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
        lineHeight: 20,
    },
    notificationTime: {
        fontSize: 12,
        color: Colors.textSecondary,
        opacity: 0.7,
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    emptyState: {
        paddingVertical: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontSize: 18,
        color: Colors.textPrimary,
        marginTop: 20,
        fontWeight: '600',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 10,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default NotificationScreen;