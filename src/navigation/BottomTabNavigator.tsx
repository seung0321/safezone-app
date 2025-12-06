// src/navigation/BottomTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import RouteScreen from '../screens/RouteScreen';
import NavigationScreen from '../screens/NavigationScreen';
import CommunityScreen from '../screens/CommunityScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';

const BottomTab = createBottomTabNavigator();

// 중앙 FAB (Floating Action Button) 컴포넌트
interface FABCenterProps {
  onPress: () => void;
}

const FABCenter: React.FC<FABCenterProps> = ({ onPress }) => {
  const insets = useSafeAreaInsets();
  return (
    <View  // ✅ TouchableOpacity → View로 변경 (클릭 불가)
      style={[styles.fabContainer, { bottom: 20 + insets.bottom }]}
    >
      <LinearGradient
        colors={[Colors.accentPrimary, Colors.accentSecondary]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fabGradient}
      >
        <FontAwesome name="shield" size={24} color="white" />
      </LinearGradient>
    </View>
  );
};

// BottomTabNavigator
const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <BottomTab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.accentPrimary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarShowLabel: true,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
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
            marginBottom: 2,
          },
          tabBarItemStyle: {
            paddingVertical: 8,
          },
        }}
        tabBar={(props) => (
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 70 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,
            backgroundColor: 'rgba(30, 30, 44, 0.95)',
            borderTopWidth: 0,
            flexDirection: 'row',
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
          }}>
            {props.state.routes.map((route, index) => {
              if (route.name === 'Navigation') return null;
              
              const isFocused = props.state.index === index;
              const color = isFocused ? Colors.accentPrimary : Colors.textSecondary;

              let iconName = '';
              let label = '';
              
              switch (route.name) {
                case '경로':
                  iconName = 'route';
                  label = '경로';
                  break;
                case '커뮤니티':
                  iconName = 'users';
                  label = '커뮤니티';
                  break;
                case '알림':
                  iconName = 'bell';
                  label = '알림';
                  break;
                case '내 정보':
                  iconName = 'user';
                  label = '내 정보';
                  break;
              }

              const onPress = () => {
                const event = props.navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  props.navigation.navigate(route.name);
                }
              };

              // 커뮤니티는 왼쪽으로, 알림은 오른쪽으로 이동
              const marginAdjustment = route.name === '커뮤니티' ? -25 : route.name === '알림' ? 25 : 0;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={onPress}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 8,
                  }}
                >
                  <View style={{ marginLeft: marginAdjustment }}>
                    <FontAwesome5 name={iconName} size={20} color={color} />
                    <Text style={{
                      fontSize: 10,
                      fontWeight: '600',
                      marginTop: 4,
                      color: color,
                      textAlign: 'center',
                    }}>
                      {label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
          name="알림"
          component={NotificationScreen}
          options={{
            tabBarIcon: ({ color }) => <FontAwesome5 name="bell" size={20} color={color} />,
          }}
        />
        <BottomTab.Screen
          name="내 정보"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={20} color={color} />,
          }}
        />
        {/* NavigationScreen - 탭바에는 표시되지 않음 */}
        <BottomTab.Screen
          name="Navigation"
          component={NavigationScreen}
          options={{
            tabBarButton: () => null,
          }}
        />
      </BottomTab.Navigator>
      
      {/* ✅ FAB 버튼 - 장식용 아이콘 (클릭 불가) */}
      <FABCenter onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
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
});

export default BottomTabNavigator;