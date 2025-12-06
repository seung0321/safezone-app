// src/api/locationService.ts
import { apiRequest } from './config';

export interface CCTVData {
  id?: string;
  district: string;        // 자치구
  address: string;         // 안심 주소
  latitude: number;        // 위도
  longitude: number;       // 경도
  cctvCount: number;       // CCTV 수량
  updatedAt?: string;      // 수정 일시
}

export interface CrimeData {
  id?: string;
  district: string;        // 자치구
  address: string;         // 안심 주소
  latitude: number;        // 위도
  longitude: number;       // 경도
  crimeType: string;       // 범죄 유형
  updatedAt?: string;      // 수정 일시
}

export interface LightData {
  id?: string;
  managementNumber: string; // 관리번호
  latitude: number;         // 위도
  longitude: number;        // 경도
}

export interface LocationBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface NearbyParams {
  latitude: number;
  longitude: number;
  radius?: number;  // 반경 (미터), 기본값 1000m
}

class LocationService {
  /**
   * 주변 CCTV 조회
   * 백엔드: GET /locations/cctv/nearby?latitude=37.5&longitude=127.0&radius=1000
   */
  async getNearbyCCTV(params: NearbyParams): Promise<CCTVData[]> {
    const { latitude, longitude, radius = 1000 } = params;
    
    return await apiRequest(
      `/locations/cctv/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
      { method: 'GET' }
    );
  }

  /**
   * 특정 지역 내 모든 CCTV 조회
   * 백엔드: GET /locations/cctv/bounds?minLat=37.5&maxLat=37.6&minLng=127.0&maxLng=127.1
   */
  async getCCTVInBounds(bounds: LocationBounds): Promise<CCTVData[]> {
    const { minLat, maxLat, minLng, maxLng } = bounds;
    
    return await apiRequest(
      `/locations/cctv/bounds?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`,
      { method: 'GET' }
    );
  }

  /**
   * 자치구별 CCTV 조회
   * 백엔드: GET /locations/cctv/district?name=중랑구
   */
  async getCCTVByDistrict(district: string): Promise<CCTVData[]> {
    return await apiRequest(
      `/locations/cctv/district?name=${encodeURIComponent(district)}`,
      { method: 'GET' }
    );
  }

  /**
   * 주변 범죄 위험 지역 조회
   * 백엔드: GET /locations/crime/nearby?latitude=37.5&longitude=127.0&radius=1000
   */
  async getNearbyCrimeData(params: NearbyParams): Promise<CrimeData[]> {
    const { latitude, longitude, radius = 1000 } = params;
    
    return await apiRequest(
      `/locations/crime/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
      { method: 'GET' }
    );
  }

  /**
   * 특정 지역 내 범죄 데이터 조회
   * 백엔드: GET /locations/crime/bounds?minLat=37.5&maxLat=37.6&minLng=127.0&maxLng=127.1
   */
  async getCrimeDataInBounds(bounds: LocationBounds): Promise<CrimeData[]> {
    const { minLat, maxLat, minLng, maxLng } = bounds;
    
    return await apiRequest(
      `/locations/crime/bounds?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`,
      { method: 'GET' }
    );
  }

  /**
   * 범죄 유형별 조회
   * 백엔드: GET /locations/crime/type?type=절도
   */
  async getCrimeDataByType(crimeType: string): Promise<CrimeData[]> {
    return await apiRequest(
      `/locations/crime/type?type=${encodeURIComponent(crimeType)}`,
      { method: 'GET' }
    );
  }

  /**
   * 주변 가로등 조회
   * 백엔드: GET /locations/lights/nearby?latitude=37.5&longitude=127.0&radius=1000
   */
  async getNearbyLights(params: NearbyParams): Promise<LightData[]> {
    const { latitude, longitude, radius = 1000 } = params;
    
    return await apiRequest(
      `/locations/lights/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
      { method: 'GET' }
    );
  }

  /**
   * 특정 지역 내 가로등 조회
   * 백엔드: GET /locations/lights/bounds?minLat=37.5&maxLat=37.6&minLng=127.0&maxLng=127.1
   */
  async getLightsInBounds(bounds: LocationBounds): Promise<LightData[]> {
    const { minLat, maxLat, minLng, maxLng } = bounds;
    
    return await apiRequest(
      `/locations/lights/bounds?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`,
      { method: 'GET' }
    );
  }

  /**
   * 안전 경로 조회 (CCTV와 가로등이 많은 경로)
   * 백엔드: POST /locations/safe-route
   */
  async getSafeRoute(start: { lat: number; lng: number }, end: { lat: number; lng: number }): Promise<any> {
    return await apiRequest('/locations/safe-route', {
      method: 'POST',
      body: JSON.stringify({
        start: { latitude: start.lat, longitude: start.lng },
        end: { latitude: end.lat, longitude: end.lng },
      }),
    });
  }

  /**
   * 종합 안전 지수 조회 (특정 위치의 안전도)
   * CCTV, 가로등, 범죄 데이터를 종합한 안전 지수
   * 백엔드: GET /locations/safety-score?latitude=37.5&longitude=127.0&radius=500
   */
  async getSafetyScore(params: NearbyParams): Promise<{
    score: number;          // 0-100 점수
    cctvCount: number;
    lightCount: number;
    crimeCount: number;
    level: 'safe' | 'moderate' | 'danger';
  }> {
    const { latitude, longitude, radius = 500 } = params;
    
    return await apiRequest(
      `/locations/safety-score?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
      { method: 'GET' }
    );
  }

  /**
   * 모든 안전 시설 한번에 조회 (최적화)
   * 백엔드: GET /locations/all-facilities?latitude=37.5&longitude=127.0&radius=1000
   */
  async getAllNearbyFacilities(params: NearbyParams): Promise<{
    cctv: CCTVData[];
    lights: LightData[];
    crimeData: CrimeData[];
  }> {
    const { latitude, longitude, radius = 1000 } = params;
    
    return await apiRequest(
      `/locations/all-facilities?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
      { method: 'GET' }
    );
  }
}

export default new LocationService();