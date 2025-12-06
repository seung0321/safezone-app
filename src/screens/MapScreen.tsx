// src/screens/MapScreen.tsx (또는 데이터를 보여줄 화면)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
// import MapView, { Marker } from 'react-native-maps'; // 지도 사용 시 주석 해제

import { getCctvList, getLightList, getCrimeList } from '../api/dataService';
import { CctvData, LightData, CrimeData } from '../types/data';

const MapScreen = () => {
  const [loading, setLoading] = useState(true);
  const [cctvs, setCctvs] = useState<CctvData[]>([]);
  const [lights, setLights] = useState<LightData[]>([]);
  const [crimes, setCrimes] = useState<CrimeData[]>([]);

  useEffect(() => {
    // 화면이 켜지면 데이터 3개를 동시에 요청함
    const fetchAllData = async () => {
      try {
        console.log("데이터 로딩 시작...");
        // Promise.all을 쓰면 3개를 병렬로 동시에 가져와서 빠릅니다
        const [cctvData, lightData, crimeData] = await Promise.all([
          getCctvList(),
          getLightList(),
          getCrimeList(),
        ]);

        setCctvs(cctvData);
        setLights(lightData);
        setCrimes(crimeData);
        
        console.log(`로딩 완료! CCTV: ${cctvData.length}개, 가로등: ${lightData.length}개`);
      } catch (e) {
        console.error("데이터 가져오기 전체 실패", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>안전 정보를 불러오는 중입니다...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 지도 라이브러리(react-native-maps)가 있다면 아래처럼 사용 */}
      {/* <MapView style={styles.map} initialRegion={{...}}>
        {cctvs.map((cctv) => (
          <Marker
            key={`cctv-${cctv.id}`}
            coordinate={{ latitude: cctv.latitude, longitude: cctv.longitude }}
            title="CCTV"
            pinColor="blue"
          />
        ))}
        {crimes.map((crime) => (
          <Marker
            key={`crime-${crime.id}`}
            coordinate={{ latitude: crime.latitude, longitude: crime.longitude }}
            title={crime.type}
            pinColor="red"
          />
        ))}
      </MapView> 
      */}
      
      {/* 테스트용: 데이터 개수 확인 */}
      <Text style={styles.text}>현재 불러온 데이터 현황</Text>
      <Text>📹 CCTV: {cctvs.length}개</Text>
      <Text>💡 가로등: {lights.length}개</Text>
      <Text>🚨 범죄주의구역: {crimes.length}개</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { width: '100%', height: '80%' },
  text: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});

export default MapScreen;