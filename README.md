# SafeRoute - AI 기반 안전 경로 추천 서비스

**SafeRoute**는 사용자의 현재 위치부터 목적지까지, CCTV, 가로등, 범죄 데이터 등 다양한 안전 요소를 종합적으로 분석하여 가장 안전한 도보 경로를 추천하고 안내하는 모바일 내비게이션 애플리케이션입니다.

---

## ✨ 주요 기능

- **AI 기반 안전 경로 추천**: 단순히 최단 거리가 아닌, 안전 점수가 가장 높은 최적의 경로를 제안합니다.
- **실시간 내비게이션**: WebView 기반의 카카오맵을 통해 사용자의 현재 위치를 추적하며 경로를 안내합니다.
- **안전 정보 시각화**: 경로 주변의 CCTV, 가로등 등 안전 시설물 정보를 지도 위에서 확인할 수 있습니다.
- **위험 구간 알림**: 경로상에 범죄 다발 구역 등 위험 요소가 있을 경우 사전에 알려줍니다.
- **장소 검색**: 카카오 API를 연동하여 키워드만으로 원하는 목적지를 쉽게 검색하고 설정할 수 있습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

프로젝트는 Mobile(클라이언트)과 Backend(서버)로 나누어 개발되었습니다.

### 📱 Mobile (Client)

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation
- **API Client**: Axios
- **Location**: Expo Location
- **Map**: React Native WebView with Kakao Maps API
- **State Management**: React Hooks (useState, useEffect)

### 🖥️ Backend

- **Framework**: Node.js, Express
- **Language**: JavaScript (ES Modules)
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Authentication**: JWT (Access / Refresh Token)
- **Testing**: Jest, Supertest

### ☁️ Infrastructure & DevOps

- **Deployment**: Render

---

## 🚀 시작하기
### 별도의 백엔드 서버가 필요합니다.
1.  **저장소 복제**
    ```bash
    git clone <repository-url>
    cd SafeRouteRN
    ```
2.  **의존성 설치**
    ```bash
    npm install
    ```

3.  **환경 변수 설정**
    프로젝트 루트에 `.env` 파일을 생성하고 아래와 같이 카카오 API 키를 입력합니다.
    ```
    KAKAO_JS_APP_KEY=여러분의_카카오_JAVASCRIPT_키
    KAKAO_REST_API_KEY=여러분의_카카오_REST_API_키
    ```

4.  **앱 실행**
    ```bash
    npx expo start -c
    ```
