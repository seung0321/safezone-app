// App.tsx
import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import Colors from './src/constants/Colors';
import { ProfileProvider } from './src/context/ProfileContext';
import { NotificationProvider } from './src/context/NotificationContext';
import notificationService from './src/services/notificationService';
import { SearchedPlace, Path } from './src/types/data';

// Push notification service
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupEmailEntryScreen from './src/screens/SignupEmailEntryScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';
import SignupScreen from './src/screens/SignupScreen';
import WritePostScreen from './src/screens/WritePostScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import PasswordChangeScreen from './src/screens/PasswordChangeScreen';
import EmergencyContactScreen from './src/screens/EmergencyContactScreen';
import AddEditContactScreen from './src/screens/AddEditContactScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import AccountDeletionScreen from './src/screens/AccountDeletionScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import SearchScreen from './src/screens/SearchScreen';
import NavigationScreen from './src/screens/NavigationScreen';

// Contact type
interface Contact {
  id: number;
  name: string;
  phone: string;
}

// RootStackParamList
export type RootStackParamList = {
  Login: undefined;
  SignupEmailEntry: undefined;
  EmailVerification: { email: string };
  Signup: { email?: string; verified?: boolean };
  Main: { screen?: string } | undefined;
  WritePost: undefined;
  PostDetail: { postId: number };
  PasswordChange: undefined;
  EmergencyContact: undefined;
  AddEditContact: {
    mode: 'add' | 'edit';
    contact?: Contact;
    onSave: (contact: Contact) => void;
  };
  ProfileEdit: undefined;
  NotificationSettings: undefined;
  AccountDeletion: undefined;
  Route: {
    selectedPlace?: SearchedPlace;
    target?: 'start' | 'end';
  };
  Navigation: {
    routeInfo: Path & { start: string; end: string };
  };
  Search: {
    target: 'start' | 'end';
  };
};

// Notification data type
interface NotificationData {
  type?: string;
  postId?: number;
  screen?: string;
  [key: string]: any;
}

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Splash screen state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await initializePushNotifications();
      setupNotificationListeners();
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
    } catch (error) {
      console.error('App initialization failed:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      notificationService.cleanup();
    };
  }, []);

  const initializePushNotifications = async () => {
    try {
      const token = await notificationService.initialize();
      if (token && __DEV__) {
        console.log('✅ Push notification ready');
        setTimeout(() => {
          notificationService.sendLocalNotification(
            '🛡️ SafeRoute Started',
            'SafeRoute is here for your safe journey!'
          );
        }, 3000);
      }
    } catch (error) {
      console.error('Push notification initialization failed:', error);
    }
  };

  const setupNotificationListeners = () => {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Foreground notification received:', notification);
      const badgeCount = notification.request.content.badge ?? 0;
      Notifications.setBadgeCountAsync(badgeCount + 1);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification clicked:', response);
      const data = response.notification.request.content.data as NotificationData;
      handleNotificationClick(data);
    });
  };

  const handleNotificationClick = (data: NotificationData) => {
    if (!navigationRef.current) return;
    const { type, postId, screen } = data;
    switch (type) {
      case 'danger_alert':
        navigationRef.current.navigate('Main', { screen: '알림' });
        break;
      case 'community_reply':
        if (postId) {
          navigationRef.current.navigate('PostDetail', { postId });
        }
        break;
      case 'route_start':
      case 'route_update':
        navigationRef.current.navigate('Main', { screen: '경로' });
        break;
      case 'sos':
        navigationRef.current.navigate('Main', { screen: '알림' });
        break;
      default:
        if (screen) {
          navigationRef.current.navigate('Main', { screen });
        }
    }
  };

  return (
    <NotificationProvider>
      <ProfileProvider>
        <SafeAreaProvider>
          <StatusBar style="light" backgroundColor={Colors.bgDark} />
          {isLoading ? (
            <SplashScreen />
          ) : (
            <NavigationContainer ref={navigationRef}>
              <Stack.Navigator 
                screenOptions={{ headerShown: false }}
                initialRouteName="Login"
              >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignupEmailEntry" component={SignupEmailEntryScreen} />
                <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="Main" component={BottomTabNavigator} />
                <Stack.Screen name="WritePost" component={WritePostScreen} />
                <Stack.Screen name="PostDetail" component={PostDetailScreen} />
                <Stack.Screen name="PasswordChange" component={PasswordChangeScreen} />
                <Stack.Screen name="EmergencyContact" component={EmergencyContactScreen} />
                <Stack.Screen name="AddEditContact" component={AddEditContactScreen} />
                <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
                <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
                <Stack.Screen name="AccountDeletion" component={AccountDeletionScreen} />
                <Stack.Screen name="Navigation" component={NavigationScreen} />
                <Stack.Screen 
                  name="Search" 
                  component={SearchScreen} 
                  options={{ presentation: 'modal' }} 
                />
              </Stack.Navigator>
            </NavigationContainer>
          )}
        </SafeAreaProvider>
      </ProfileProvider>
    </NotificationProvider>
  );
}
