// src/styles/GlobalStyles.ts
import { StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

export const GlobalStyles = StyleSheet.create({
  // 앱 전체 컨테이너
  appContainer: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  // 스크롤 가능한 메인 내용 영역
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  // 카드 스타일
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
  // 섹션 헤더
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 15,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentPrimary,
  },
  // 기본 텍스트
  textPrimary: {
    color: Colors.textPrimary,
  },
  textSecondary: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
});