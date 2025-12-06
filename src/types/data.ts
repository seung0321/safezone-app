// src/types/data.ts

// 1. 경로 추천 API 응답 데이터 타입
export interface Location {
  name: string;
  lat: number;
  lon: number;
}

export interface PathSummary {
  distance: number; // 미터 단위
  duration: number; // 초 단위
}

export interface Path {
  id: number;
  summary: PathSummary;
  coordinates: [number, number][]; // [경도, 위도] 쌍의 배열
  score: number;
  alerts?: string[]; // 경로상 위험 요소(경고)
}

export interface Recommendation {
  start: Location;
  end: Location;
  bestPath: Path;
  allPaths: Path[];
}

// 2. 카카오 장소 검색 결과 타입
export interface SearchedPlace {
  id: string;
  place_name: string;      // 장소명
  category_name: string;   // 카테고리
  address_name: string;    // 전체 지번 주소
  road_address_name: string; // 전체 도로명 주소
  x: string;               // 경도(longitude)
  y: string;               // 위도(latitude)
}
