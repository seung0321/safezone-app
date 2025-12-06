// src/navigation/BottomTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { StyleSheet, View, TouchableOpacity } from 'react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient'; 
import Colors from '../constants/Colors';
import RouteScreen from '../screens/RouteScreen';
import CommunityScreen from '../screens/CommunityScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';

// FAB용 더미 스크린
const FABPlaceholder = () => <View />;

const BottomTab = createBottomTabNavigator();

// 중앙 FAB (Floating Action Button) 컴포넌트
const FABCenter = ({ onPress }: { onPress: () => void }) => {
  const insets = useSafeAreaInsets();
  return (
    <TouchableOpacity 
      style={[styles.fabContainer, { bottom: 10 + insets.bottom }]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[Colors.accentPrimary, Colors.accentSecondary]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fabGradient}
      >
        <FontAwesome name="shield" size={24} color="white" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

// BottomTabNavigator
const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  // TODO: 실제 알림 개수는 Context나 Redux로 관리
  const notificationCount = 3;

  return (
    <>
      <BottomTab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.accentPrimary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarShowLabel: true,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: 70 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,
            backgroundColor: 'rgba(30, 30, 44, 0.95)',
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 4,
          },
        }}
      >
        <BottomTab.Screen
          name="경로"
          component={RouteScreen}
          options={{
            tabBarIcon: ({ color }) => <FontAwesome5 name="route" size={20} color={color} />,
          }}
        />
        <BottomTab.Screen
          name="커뮤니티"
          component={CommunityScreen}
          options={{
            tabBarIcon: ({ color }) => <FontAwesome5 name="users" size={20} color={color} />,
          }}
        />
        <BottomTab.Screen
          name="FAB"
          component={FABPlaceholder}
          options={{
            tabBarLabel: '시작',
            tabBarIcon: () => null,
            tabBarButton: (props) => (
              <FABCenter onPress={() => alert('FAB: 경로 탐색/안내 시작')} />
            ),
          }}
        />
        <BottomTab.Screen
          name="알림"
          component={NotificationScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <View>
                <FontAwesome5 name="bell" size={20} color={color} />
                {notificationCount > 0 && (
                  <View style={styles.badge}>
                    <View style={styles.badgeInner}>
                      {/* 숫자 표시 없이 점만 표시 */}
                    </View>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <BottomTab.Screen
          name="내 정보"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={20} color={color} />,
          }}
        />
      </BottomTab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: -15, 
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(30, 30, 44, 0.95)',
  },
  badgeInner: {
    // 빨간 점만 표시
  },
});

export default BottomTabNavigator;