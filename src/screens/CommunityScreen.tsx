// src/screens/CommunityScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import boardService, { Post } from '../api/boardService';
import PrimaryButton from '../components/PrimaryButton';
import { getErrorMessage } from '../api/errors';

interface CommunityScreenProps {
  navigation: any;
  route: any;
}

type Category = 'all' | 'free' | 'inquiry' | 'report';
type SearchType = 'title' | 'content' | 'title_content' | 'author';
type SortBy = 'latest' | 'popular';

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation, route }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('title_content');
  const [sortBy, setSortBy] = useState<SortBy>('latest');
  const [page, setPage] = useState(1);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // ✅ useRef로 변경
  const searchAnim = useRef(new Animated.Value(0)).current;

  const categories = [
    { id: 'all' as Category, label: '전체', icon: 'th-large' },
    { id: 'free' as Category, label: '자유', icon: 'comments' },
    { id: 'inquiry' as Category, label: '문의', icon: 'question-circle' },
    { id: 'report' as Category, label: '제보', icon: 'bullhorn' },
  ];

  const searchTypes = [
    { id: 'title_content' as SearchType, label: '제목+내용', icon: 'align-left' },
    { id: 'title' as SearchType, label: '제목', icon: 'heading' },
    { id: 'content' as SearchType, label: '내용', icon: 'file-alt' },
    { id: 'author' as SearchType, label: '작성자', icon: 'user' },
  ];

  useEffect(() => {
    loadPosts(true);
  }, [selectedCategory]);

  useEffect(() => {
    if (route.params?.timestamp) {
      const { action } = route.params;
      
      if (action === 'create' || action === 'edit' || action === 'delete') {
        loadPosts(true);
      }

      setTimeout(() => {
        navigation.setParams({
          newPost: undefined,
          action: undefined,
          deletedPostId: undefined,
          timestamp: undefined,
        });
      }, 0);
    }
  }, [route.params?.timestamp]);

  const loadPosts = async (refresh: boolean = false) => {
    if (loading && !refresh) return;

    if (refresh) {
      setRefreshing(true);
      setPage(1);
    } else {
      setLoading(true);
    }

    try {
      const params: any = {
        page: refresh ? 1 : page,
        pageSize: 20,
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (searchQuery.trim()) {
        params.searchType = searchType;
        params.keyword = searchQuery.trim();
      }

      console.log('📤 게시글 조회 파라미터:', params);

      const response = await boardService.getPosts(params);

      if (refresh) {
        setPosts(response.posts);
      } else {
        setPosts([...posts, ...response.posts]);
      }
    } catch (error: any) {
      console.error('게시글 로드 실패:', error);
      Alert.alert('오류', getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadPosts(true);
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setPosts([]);
  };

  const handleSearch = () => {
    console.log('🔍 검색 실행:', { searchType, searchQuery });
    if (searchQuery.trim()) {
      loadPosts(true);
    } else {
      Alert.alert('알림', '검색어를 입력해주세요.');
    }
  };

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type);
    if (searchQuery.trim()) {
      setTimeout(() => {
        loadPosts(true);
      }, 100);
    }
  };

  const toggleSearch = () => {
    const toValue = isSearchVisible ? 0 : 1;
    setIsSearchVisible(!isSearchVisible);

    Animated.spring(searchAnim, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();

    if (isSearchVisible) {
      setSearchQuery('');
      loadPosts(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    loadPosts(true);
  };

  const openPostDetail = (post: Post) => {
    navigation.navigate('PostDetail', {
      post: post,
      postId: post.id,
    });
  };

  const handleWritePost = () => {
    navigation.navigate('WritePost');
  };

  const getCategoryText = (category: string) => {
    const map: Record<string, string> = {
      free: '자유',
      inquiry: '문의',
      report: '제보',
    };
    return map[category] || category;
  };

  const getCategoryStyle = (category: string) => {
    const map: Record<string, any> = {
      free: styles.tagSafety,
      inquiry: styles.tagDanger,
      report: styles.tagBuddy,
    };
    return map[category] || styles.tagSafety;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  const searchHeight = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 140], // ✅ 높이 증가
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.appHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>💬 커뮤니티</Text>
          <Text style={styles.pageSubtitle}>
            안심 정보를 공유하세요. ({posts.length}개 게시글)
          </Text>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={toggleSearch}>
          <FontAwesome5
            name={isSearchVisible ? 'times' : 'search'}
            size={18}
            color={Colors.accentPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* ✅ 검색 영역 - 항상 렌더링하되 높이와 투명도로 제어 */}
      <Animated.View 
        style={[
          styles.searchContainer, 
          { 
            height: searchHeight, 
            opacity: searchAnim,
          }
        ]}
        pointerEvents={isSearchVisible ? 'auto' : 'none'}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.searchTypeScroll}
        >
          {searchTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.searchTypeBtn,
                searchType === type.id && styles.searchTypeBtnActive,
              ]}
              onPress={() => handleSearchTypeChange(type.id)}
            >
              <FontAwesome5 
                name={type.icon as any} 
                size={11} 
                color={searchType === type.id ? 'white' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.searchTypeText,
                  searchType === type.id && styles.searchTypeTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.searchInputWrapper}>
          <FontAwesome5 name="search" size={14} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={`${searchTypes.find(t => t.id === searchType)?.label}으로 검색...`}
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <FontAwesome5 name="times-circle" size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.communityContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        <View style={styles.writeButtonContainer}>
          <PrimaryButton
            title="✏️ 안전 정보 공유하기"
            onPress={handleWritePost}
            style={styles.writeButton}
          />
        </View>

        <View style={styles.controlsRow}>
          <Text style={styles.sectionHeaderSmall}>필터</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[styles.sortBtn, sortBy === 'latest' && styles.sortBtnActive]}
              onPress={() => setSortBy('latest')}
            >
              <FontAwesome5
                name="clock"
                size={10}
                color={sortBy === 'latest' ? 'white' : Colors.textSecondary}
              />
              <Text style={[styles.sortBtnText, sortBy === 'latest' && styles.sortBtnTextActive]}>
                최신순
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortBtn, sortBy === 'popular' && styles.sortBtnActive]}
              onPress={() => setSortBy('popular')}
            >
              <FontAwesome5
                name="fire"
                size={10}
                color={sortBy === 'popular' ? 'white' : Colors.textSecondary}
              />
              <Text style={[styles.sortBtnText, sortBy === 'popular' && styles.sortBtnTextActive]}>
                인기순
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterBtn, selectedCategory === cat.id && styles.filterBtnActive]}
              onPress={() => handleCategoryChange(cat.id)}
            >
              <FontAwesome5
                name={cat.icon as any}
                size={12}
                color={selectedCategory === cat.id ? 'white' : Colors.textSecondary}
              />
              <Text style={[styles.filterBtnText, selectedCategory === cat.id && styles.filterBtnTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.postsHeader}>
          <Text style={styles.sectionHeader}>
            {searchQuery ? `검색 결과 (${posts.length})` : '최근 게시글'}
          </Text>
          {searchQuery && (
            <View style={styles.searchInfo}>
              <FontAwesome5 name="info-circle" size={12} color={Colors.accentPrimary} />
              <Text style={styles.searchInfoText}>
                '{searchQuery}' - {searchTypes.find(t => t.id === searchType)?.label} 검색
              </Text>
            </View>
          )}
        </View>

        {loading && !refreshing && posts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5
              name={searchQuery ? 'search' : 'comments'}
              size={60}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? `'${searchQuery}'에 대한\n검색 결과가 없습니다.`
                : '게시글이 없습니다.\n첫 번째 글을 작성해보세요!'}
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.postCard}
              activeOpacity={0.7}
              onPress={() => openPostDetail(post)}
            >
              <View style={styles.postHeader}>
                <Text style={[styles.postTag, getCategoryStyle(post.category)]}>
                  {getCategoryText(post.category)}
                </Text>
                <Text style={styles.postTime}>{formatDate(post.createdAt)}</Text>
              </View>

              <Text style={styles.postTitle} numberOfLines={1}>
                {post.title}
              </Text>

              <View style={styles.postMeta}>
                <FontAwesome5 name="user-circle" size={12} color="#B9D9EB" />
                <Text style={styles.postUser}>{post.authorUser?.nickname || 'Unknown'}</Text>
              </View>

              <Text style={styles.postContentSummary} numberOfLines={2}>
                {post.content}
              </Text>

              <View style={styles.postFooter}>
                <View style={styles.postFooterItem}>
                  <FontAwesome5 name="comment" size={12} color={Colors.textSecondary} />
                  <Text style={styles.postFooterText}>{post._count?.comments || 0}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {loading && !refreshing && posts.length > 0 && (
          <View style={styles.footerLoader}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  scrollView: {
    flex: 1,
  },
  communityContent: {
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
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(106, 137, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    overflow: 'hidden',
    backgroundColor: Colors.bgDark,
  },
  searchTypeScroll: {
    marginTop: 10,
    marginBottom: 10,
    flexGrow: 0,
  },
  searchTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#2D2D45',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchTypeBtnActive: {
    backgroundColor: Colors.accentPrimary,
    borderColor: Colors.accentPrimary,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchTypeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  searchTypeTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D45',
    borderRadius: 12,
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  writeButtonContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  writeButton: {
    shadowColor: Colors.accentSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeaderSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentPrimary,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#2D2D45',
  },
  sortBtnActive: {
    backgroundColor: Colors.accentPrimary,
  },
  sortBtnText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sortBtnTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  filterScroll: {
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 10,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    backgroundColor: '#2D2D45',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterBtnActive: {
    backgroundColor: Colors.accentPrimary,
    shadowColor: Colors.accentPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  filterBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterBtnTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  postsHeader: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentPrimary,
  },
  searchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  searchInfoText: {
    fontSize: 12,
    color: Colors.accentPrimary,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: Colors.bgCard,
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
  },
  tagSafety: {
    backgroundColor: Colors.accentPrimary,
    color: 'white',
  },
  tagDanger: {
    backgroundColor: Colors.danger,
    color: 'white',
  },
  tagBuddy: {
    backgroundColor: Colors.accentSecondary,
    color: 'white',
  },
  postTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  postUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B9D9EB',
  },
  postContentSummary: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 5,
  },
  postFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  postFooterText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default CommunityScreen;