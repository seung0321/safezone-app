import { apiRequest } from './config';
import { Recommendation, SearchedPlace } from '../types/data';
import { KAKAO_REST_API_KEY } from '@env'; // .env 파일에서 키를 불러옵니다.
import axios from 'axios';

const kakaoApiClient = axios.create({
  baseURL: 'https://dapi.kakao.com',
  headers: {
    // KAKAO_REST_API_KEY 변수를 직접 사용합니다.
    Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
  },
});

/**
 * 백엔드 서버에 안전 경로 추천을 요청합니다.
 */
export const getRecommendedRoute = async (
  startLat: number,
  startLon: number,
  endKeyword: string,
  userId?: number
): Promise<Recommendation | null> => {
  try {
    let endpoint = `/path/recommend?startLat=${startLat}&startLon=${startLon}&endKeyword=${encodeURIComponent(endKeyword)}`;
    if (userId) {
      endpoint += `&userId=${userId}`;
    }
    const response = await apiRequest(endpoint, { method: 'GET' });

    if (response && response.success) {
      return response.data;
    }
    console.log('경로 추천 실패 (서버 응답):', response?.error || 'API Error');
    return null;

  } catch (error) {
    console.error('경로 추천 데이터 로딩 중 에러 발생:', error);
    throw error;
  }
};

/**
 * 카카오 API를 사용해 키워드로 장소를 검색합니다.
 */
export const searchPlacesByKeyword = async (keyword: string): Promise<SearchedPlace[]> => {
  if (!keyword.trim()) return [];

  try {
    const response = await kakaoApiClient.get('/v2/local/search/keyword.json', {
      params: {
        query: keyword,
        size: 15,
      },
    });
    return response.data.documents;
  } catch (error) {
    console.error('장소 검색 API 호출 중 에러 발생:', error);
    return [];
  }
};
