import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { Path } from '../types/data';
import { KAKAO_JS_APP_KEY } from '@env'; // .env 파일에서 키를 불러옵니다.

type NavigationScreenProps = {
    route: { params: { routeInfo: Path & { start: string; end: string } } };
    navigation: any;
};

const NavigationScreen: React.FC<NavigationScreenProps> = ({ route, navigation }) => {
  const { routeInfo } = route.params;

  const webViewRef = useRef<WebView>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!isWebViewReady) return;

    const startLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한 필요', '실시간 위치를 추적하려면 권한이 필요합니다.');
        return;
      }
      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 10 },
        (location) => {
          const locData = { type: 'USER_LOCATION', payload: { latitude: location.coords.latitude, longitude: location.coords.longitude } };
          webViewRef.current?.postMessage(JSON.stringify(locData));
        }
      );
      setLocationSubscription(subscription);
    };
    startLocationTracking();
    return () => { locationSubscription?.remove(); };
  }, [isWebViewReady]);

  // 카카오 지도 HTML (API 키를 환경 변수에서 가져오도록 수정)
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Kakao Map</title>
        <style>html, body { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; } #map_div { width: 100%; height: 100%; }</style>
    </head>
    <body>
        <div id="map_div"></div>
        <script>
          const routeCoordinates = ${JSON.stringify(routeInfo.coordinates)};
        </script>
        <script
            type="text/javascript"
            src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_APP_KEY}&libraries=services,clusterer,drawing&autoload=false"
        ></script>
        <script>
            kakao.maps.load(function() {
                const mapContainer = document.getElementById('map_div');
                let userMarker = null;

                const mapOption = { center: new kakao.maps.LatLng(37.50802, 127.06283), level: 5 };
                const map = new kakao.maps.Map(mapContainer, mapOption);

                if (routeCoordinates && routeCoordinates.length > 0) {
                    const linePath = routeCoordinates.map(c => new kakao.maps.LatLng(c[1], c[0]));
                    const bounds = new kakao.maps.LatLngBounds();
                    linePath.forEach(latlng => bounds.extend(latlng));

                    const polyline = new kakao.maps.Polyline({ path: linePath, strokeWeight: 6, strokeColor: '#6A89FF', strokeOpacity: 0.9, strokeStyle: 'solid' });
                    polyline.setMap(map);

                    const startMarker = new kakao.maps.Marker({ position: linePath[0] });
                    const endMarker = new kakao.maps.Marker({ position: linePath[linePath.length - 1] });
                    startMarker.setMap(map);
                    endMarker.setMap(map);

                    map.setBounds(bounds);
                }

                window.addEventListener('message', (event) => {
                    try {
                        const { type, payload } = JSON.parse(event.data);
                        if (type === 'USER_LOCATION') {
                            const userPosition = new kakao.maps.LatLng(payload.latitude, payload.longitude);
                            if (!userMarker) {
                                userMarker = new kakao.maps.Marker({
                                    position: userPosition,
                                    image: new kakao.maps.MarkerImage('https://ssl.pstatic.net/static/maps/m/pin_rd.png', new kakao.maps.Size(24, 24), { offset: new kakao.maps.Point(12, 12) })
                                });
                                userMarker.setMap(map);
                            } else {
                                userMarker.setPosition(userPosition);
                            }
                        }
                    } catch (e) {}
                });

                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'webview_ready' }));
            });
        </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{routeInfo.end}</Text>
          <Text style={styles.headerSubtitle}>{`${Math.round(routeInfo.summary.duration / 60)}분`} | {`${(routeInfo.summary.distance / 1000).toFixed(2)}km`} | 안전점수 {Math.round(routeInfo.score)}점</Text>
        </View>
      </View>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator color={Colors.accentPrimary} size="large" style={styles.absoluteFill} />}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'webview_ready') {
              setIsWebViewReady(true);
            }
          } catch(e) {}
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgDark },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.bgDark },
    backButton: { marginRight: 15, padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
    headerSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
    webview: { flex: 1 },
    absoluteFill: StyleSheet.absoluteFill,
});

export default NavigationScreen;
