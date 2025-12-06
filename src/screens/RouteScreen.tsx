// src/screens/RouteScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import PrimaryButton from '../components/PrimaryButton';
import { getRecommendedRoute } from '../api/dataService';
import { Path, Recommendation, SearchedPlace } from '../types/data';

// Location 동적 import
let Location: any = null;
let locationAvailable = false;
try {
  Location = require('expo-location');
  locationAvailable = true;
} catch (error) {
  console.warn('expo-location not available - using mock location');
  locationAvailable = false;
}

// ───────────────── RouteItem 컴포넌트 ─────────────────

interface RouteItemProps {
  name: string;
  duration: string;
  distance: string;
  details: string;
  safetyScore: number;
  isRecommended: boolean;
  onPress: () => void;
}

const getSafetyBadgeStyle = (score: number) => {
  if (score >= 90) return { style: styles.safetyHigh, text: Math.round(score) };
  if (score >= 70) return { style: styles.safetyMedium, text: Math.round(score) };
  return { style: styles.safetyLow, text: Math.round(score) };
};

const RouteItem: React.FC<RouteItemProps> = ({
  name,
  duration,
  distance,
  details,
  safetyScore,
  isRecommended,
  onPress,
}) => {
  const { style: badgeStyle, text: badgeText } = getSafetyBadgeStyle(safetyScore);
  const itemStyle = isRecommended ? [styles.routeItem, styles.routeRecommended] : styles.routeItem;

  return (
    <TouchableOpacity style={itemStyle} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.routeInfo}>
        <Text style={styles.routeInfoStrong}>{name}</Text>
        <Text style={styles.routeInfoSpan}>
          {duration} | {distance} | {details}
        </Text>
      </View>
      <View style={[styles.safetyBadge, badgeStyle]}>
        <Text style={styles.safetyBadgeText}>{badgeText}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ───────────────── RouteScreen 메인 컴포넌트 ─────────────────

interface RouteScreenProps {
  navigation: any;
  route: any;
}

const RouteScreen: React.FC<RouteScreenProps> = ({ navigation, route }) => {
  const [currentTime, setCurrentTime] = useState('');

  // 출발지 / 도착지 정보
  const [startLocation, setStartLocation] = useState<{
    name: string;
    coords: { latitude: number; longitude: number };
  } | null>(null);

  const [endLocation, setEndLocation] = useState<{
    name: string;
    coords: { latitude: number; longitude: number };
  } | null>(null);

  const [isLoadingLocation, setIsLoadingLocation] = useState(true); // 처음에는 위치 가져오는 중
  const [isSearchingRoutes, setIsSearchingRoutes] = useState(false);
  const [routes, setRoutes] = useState<Path[]>([]);
  const [showRoutes, setShowRoutes] = useState(false);

  // 시계
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes(),
        ).padStart(2, '0')}`,
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // 최초 진입 시 현위치 → 출발지로 설정
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // 검색 화면에서 돌아왔을 때 선택한 장소 반영
  useEffect(() => {
    if (route?.params?.selectedPlace && route?.params?.target) {
      const { selectedPlace, target } = route.params as {
        selectedPlace: SearchedPlace;
        target: 'start' | 'end';
      };

      const locationData = {
        name: selectedPlace.place_name,
        coords: {
          latitude: parseFloat(selectedPlace.y),
          longitude: parseFloat(selectedPlace.x),
        },
      };

      if (target === 'start') {
        setStartLocation(locationData);
      } else {
        setEndLocation(locationData);
      }

      // 파라미터 초기화 (중복 반영 방지)
      navigation.setParams({ selectedPlace: undefined, target: undefined });
    }
  }, [route?.params?.selectedPlace, route?.params?.target, navigation, route?.params]);

  // ───────────────── 현재 위치 가져오기 ─────────────────

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);

    // expo-location 모듈이 아예 없는 경우 (테스트 모드)
    if (!locationAvailable) {
      console.warn('Location module not available - using mock location');
      const mockCoords = { latitude: 37.498095, longitude: 127.02761 }; // 강남역 근처
      setStartLocation({
        name: '서울시 강남구 역삼동 (테스트 위치)',
        coords: mockCoords,
      });
      setIsLoadingLocation(false);
      setTimeout(
        () =>
          Alert.alert(
            '🔍 테스트 모드',
            '실제 위치를 사용하려면 개발 빌드가 필요합니다.\n현재는 테스트 위치(강남역)를 사용합니다.',
          ),
        500,
      );
      return;
    }

    try {
      // 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '위치 권한 필요',
          '안전한 경로를 추천받으려면 위치 권한이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '설정으로 이동',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Alert.alert(
                    '알림',
                    '설정 > SafeRoute > 위치에서 권한을 허용해주세요.',
                  );
                } else {
                  Alert.alert(
                    '알림',
                    '설정 > 앱 > SafeRoute > 권한에서 위치를 허용해주세요.',
                  );
                }
              },
            },
          ],
        );
        setIsLoadingLocation(false);
        return;
      }

      // 현재 좌표
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // 역지오코딩 → 주소 문자열
      const address = await Location.reverseGeocodeAsync(coords);

      if (address && address.length > 0) {
        const addr = address[0];
        const locationText = `${addr.city || ''} ${addr.district || ''} ${
          addr.street || ''
        }`.trim();
        setStartLocation({
          name: locationText || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
          coords,
        });
      } else {
        setStartLocation({
          name: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
          coords,
        });
      }
    } catch (error) {
      console.error('위치 가져오기 실패:', error);
      Alert.alert('오류', '위치를 가져오는데 실패했습니다.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // ───────────────── 경로 탐색 (서버 변경에 따라 다시 수정됨) ─────────────────

  const searchRoute = async () => {
    if (!startLocation) {
      Alert.alert('알림', '출발지를 설정해주세요.');
      return;
    }
    if (!endLocation) {
      Alert.alert('알림', '도착지를 설정해주세요.');
      return;
    }

    setIsSearchingRoutes(true);
    setShowRoutes(false);

    try {
      console.log('🚀 경로 추천 요청:', {
        start: startLocation.coords,
        endKeyword: endLocation.name,
      });

      // getRecommendedRoute가 키워드를 받도록 다시 수정
      const result: Recommendation | null = await getRecommendedRoute(
        startLocation.coords.latitude,
        startLocation.coords.longitude,
        endLocation.name, // 목적지 키워드를 전달
      );

      if (result && result.allPaths && result.allPaths.length > 0) {
        const sortedPaths = result.allPaths.sort((a, b) => {
          if (a.id === result.bestPath.id) return -1;
          if (b.id === result.bestPath.id) return 1;
          return b.score - a.score;
        });

        setRoutes(sortedPaths);
        setShowRoutes(true);
        console.log('✅ 경로 추천 결과:', result);
      } else {
        // API에서 null을 반환하거나 경로가 없는 경우 (서버 로직과 연동)
        Alert.alert('경로 탐색 실패', '추천 경로를 찾을 수 없습니다. 도보 이동이 불가능한 경로일 수 있습니다.');
        setRoutes([]);
      }
    } catch (error: any) {
      // dataService에서 던진 네트워크 오류 등을 여기서 잡습니다.
      console.error('❌ API Request Error:', error.message);
      Alert.alert('네트워크 오류', '경로를 탐색하는 중 서버와 통신에 실패했습니다. 인터넷 연결을 확인해주세요.');
      setRoutes([]);
    } finally {
      setIsSearchingRoutes(false);
    }
  };


  // ───────────────── 경로 선택 시 네비게이션 화면으로 이동 ─────────────────

  const handleRouteSelect = (route: Path) => {
    if (!startLocation || !endLocation) return;

    navigation.navigate('Navigation', {
      routeInfo: {
        ...route,
        name: `경로 ${route.id + 1}`,
        start: startLocation.name,
        end: endLocation.name,
      },
    });
  };

  // ───────────────── 렌더링 ─────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.pageTitle}>SafeRoute</Text>
          <Text style={styles.pageSubtitle}>{currentTime}</Text>
        </View>
        <View style={styles.locationBadge}>
          <FontAwesome5 name="map-marker-alt" size={12} color={Colors.accentPrimary} />
          <Text style={styles.locationBadgeText}>
            {locationAvailable ? '위치 활성화됨' : '테스트 모드'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.routeScreenContent}>
        {/* 검색 영역 카드 */}
        <View style={[styles.card, styles.searchAreaCard]}>
          {/* 출발지 */}
          <View style={styles.locationInputGroup}>
            <FontAwesome5 name="location-arrow" size={16} color={Colors.accentPrimary} />
            <TouchableOpacity
              style={styles.inputField}
              onPress={() => navigation.navigate('Search', { target: 'start' })}
            >
              <Text
                style={startLocation ? styles.locationText : styles.placeholderText}
                numberOfLines={1}
              >
                {startLocation ? startLocation.name : '출발지 선택'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.locationButtonCustom}
              onPress={getCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.locationButtonTextCustom}>현위치</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 도착지 */}
          <View style={[styles.locationInputGroup, { marginBottom: 20 }]}>
            <FontAwesome5 name="bullseye" size={16} color={Colors.accentPrimary} />
            <TouchableOpacity
              style={styles.inputField}
              onPress={() => navigation.navigate('Search', { target: 'end' })}
            >
              <Text
                style={endLocation ? styles.locationText : styles.placeholderText}
                numberOfLines={1}
              >
                {endLocation ? endLocation.name : '도착지 검색'}
              </Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton
            title={isSearchingRoutes ? '경로 탐색 중...' : '🔍 안전 경로 탐색'}
            onPress={searchRoute}
            disabled={isSearchingRoutes || isLoadingLocation}
          />
        </View>

        {/* 로딩 인디케이터 */}
        {isSearchingRoutes && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accentPrimary} />
            <Text style={styles.loadingText}>AI가 최적의 안전 경로를 찾고 있습니다...</Text>
          </View>
        )}

        {/* 경로 결과 */}
        {showRoutes && routes.length > 0 && (
          <>
            <View style={styles.routeResultsHeader}>
              <Text style={styles.sectionHeader}>AI 추천 경로</Text>
              <View style={styles.resultBadge}>
                <FontAwesome5 name="route" size={12} color={Colors.accentPrimary} />
                <Text style={styles.resultBadgeText}>{routes.length}개 경로 발견</Text>
              </View>
            </View>
            <View style={styles.routeResults}>
              {routes.map((route) => (
                <RouteItem
                  key={route.id}
                  name={`경로 ${route.id + 1}`}
                  duration={`${Math.round(route.summary.duration / 60)}분`}
                  distance={`${(route.summary.distance / 1000).toFixed(2)}km`}
                  details={route.alerts?.join(', ') || '특이사항 없음'}
                  safetyScore={route.score}
                  isRecommended={routes[0].id === route.id}
                  onPress={() => handleRouteSelect(route)}
                />
              ))}
            </View>
          </>
        )}

        {/* 안내 메시지 (초기 화면) */}
        {!showRoutes && !isSearchingRoutes && (
          <View style={styles.infoCard}>
            <FontAwesome5 name="info-circle" size={40} color={Colors.accentPrimary} />
            <Text style={styles.infoTitle}>안전한 경로를 찾아드립니다</Text>
            <Text style={styles.infoText}>
              출발지와 도착지를 선택하시면{'\n'}
              AI가 실시간 안전 정보를 분석하여{'\n'}
              가장 안전한 경로를 추천해드립니다.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ───────────────── 스타일 ─────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  routeScreenContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: Colors.bgDark,
  },
  pageTitle: {
    fontSize: 35,
    fontWeight: '700',
    color: Colors.accentPrimary,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(106, 137, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  locationBadgeText: {
    fontSize: 11,
    color: Colors.accentPrimary,
    fontWeight: '600',
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
  searchAreaCard: {},
  locationInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  inputField: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#2D2D45',
    borderColor: '#3C3C5C',
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    height: 48,
  },
  locationText: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  locationButtonCustom: {
    width: 85,
    height: 44,
    backgroundColor: Colors.accentSecondary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonTextCustom: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 15,
  },
  loadingText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  routeResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentPrimary,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(106, 137, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resultBadgeText: {
    fontSize: 12,
    color: Colors.accentPrimary,
    fontWeight: '600',
  },
  routeResults: {},
  routeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#2D2D45',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  routeRecommended: {
    borderWidth: 2,
    borderColor: Colors.accentPrimary,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  routeInfo: {
    flex: 1,
    marginRight: 10,
  },
  routeInfoStrong: {
    fontSize: 17,
    color: 'white',
    fontWeight: 'bold',
  },
  routeInfoSpan: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  safetyBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  safetyHigh: { backgroundColor: Colors.accentPrimary },
  safetyMedium: { backgroundColor: '#FFC107' },
  safetyLow: { backgroundColor: '#A0522D' },
  infoCard: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default RouteScreen;
