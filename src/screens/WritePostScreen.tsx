// src/screens/WritePostScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import boardService from '../api/boardService';
import PrimaryButton from '../components/PrimaryButton';

interface WritePostScreenProps {
  navigation: any;
  route: any;
}

const WritePostScreen: React.FC<WritePostScreenProps> = ({ navigation, route }) => {
  const mode = route.params?.mode || 'create';
  const postId = route.params?.postId || route.params?.post?.id;
  const existingPost = route.params?.post;

  const [selectedCategory, setSelectedCategory] = useState<'free' | 'inquiry' | 'report' | null>(
    existingPost?.category || null
  );
  const [title, setTitle] = useState(existingPost?.title || '');
  const [content, setContent] = useState(existingPost?.content || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingPost) {
      setSelectedCategory(existingPost.category);
      setTitle(existingPost.title);
      setContent(existingPost.content);
    }
  }, [existingPost]);

  const validateForm = (): boolean => {
    if (!selectedCategory) {
      Alert.alert('입력 오류', '카테고리를 선택해주세요.');
      return false;
    }

    if (!title.trim()) {
      Alert.alert('입력 오류', '제목을 입력해주세요.');
      return false;
    }

    if (title.trim().length < 2) {
      Alert.alert('입력 오류', '제목은 최소 2자 이상 입력해주세요.');
      return false;
    }

    if (!content.trim()) {
      Alert.alert('입력 오류', '내용을 입력해주세요.');
      return false;
    }

    if (content.trim().length < 10) {
      Alert.alert('입력 오류', '내용은 최소 10자 이상 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = {
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory!,
      };

      if (mode === 'edit' && postId) {
        console.log('📝 게시글 수정:', postId, data);
        await boardService.updatePost(postId, data);
        
        Alert.alert('✅', '게시글이 수정되었습니다!', [
          {
            text: '확인',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]);
      } else {
        console.log('📝 게시글 작성:', data);
        await boardService.createPost(data);

        Alert.alert('✅', '게시글이 등록되었습니다!', [
          {
            text: '확인',
            onPress: () => {
              navigation.navigate('Main', {
                screen: '커뮤니티',
                params: {
                  action: 'create',
                  timestamp: Date.now(),
                },
              });
            }
          }
        ]);
      }
    } catch (error: any) {
      console.error('게시글 작성/수정 실패:', error);

      if (error.message === 'UNAUTHORIZED') {
        Alert.alert('인증 오류', '로그인이 필요합니다.');
      } else {
        Alert.alert(
          '오류',
          mode === 'edit' ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{mode === 'edit' ? '글 수정' : '글쓰기'}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeader}>카테고리 선택</Text>
          <View style={styles.categoryContainer}>
            <TouchableOpacity
              style={[
                styles.categoryBtn,
                selectedCategory === 'free' && styles.categoryBtnActive,
                selectedCategory === 'free' && styles.categoryBtnSafety,
              ]}
              onPress={() => setSelectedCategory('free')}
              disabled={loading}
            >
              <FontAwesome5
                name="comments"
                size={16}
                color={selectedCategory === 'free' ? 'white' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryBtnText,
                  selectedCategory === 'free' && styles.categoryBtnTextActive,
                ]}
              >
                자유
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryBtn,
                selectedCategory === 'inquiry' && styles.categoryBtnActive,
                selectedCategory === 'inquiry' && styles.categoryBtnDanger,
              ]}
              onPress={() => setSelectedCategory('inquiry')}
              disabled={loading}
            >
              <FontAwesome5
                name="question-circle"
                size={16}
                color={selectedCategory === 'inquiry' ? 'white' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryBtnText,
                  selectedCategory === 'inquiry' && styles.categoryBtnTextActive,
                ]}
              >
                문의
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryBtn,
                selectedCategory === 'report' && styles.categoryBtnActive,
                selectedCategory === 'report' && styles.categoryBtnBuddy,
              ]}
              onPress={() => setSelectedCategory('report')}
              disabled={loading}
            >
              <FontAwesome5
                name="bullhorn"
                size={16}
                color={selectedCategory === 'report' ? 'white' : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryBtnText,
                  selectedCategory === 'report' && styles.categoryBtnTextActive,
                ]}
              >
                제보
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionHeader}>제목</Text>
          <TextInput
            style={styles.input}
            placeholder="제목을 입력하세요"
            placeholderTextColor={Colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={50}
            editable={!loading}
          />
          <Text style={styles.charCount}>{title.length}/50</Text>

          <Text style={styles.sectionHeader}>내용</Text>
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="안전 정보를 자세히 공유해주세요."
            placeholderTextColor={Colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={500}
            editable={!loading}
          />
          <Text style={styles.charCount}>{content.length}/500</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <PrimaryButton
              title={mode === 'edit' ? '✏️ 수정 완료' : '✏️ 게시하기'}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: '#3C3C5C',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  categoryBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#2D2D45',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: 8,
  },
  categoryBtnActive: {
    borderWidth: 2,
  },
  categoryBtnSafety: {
    backgroundColor: Colors.accentPrimary,
    borderColor: Colors.accentPrimary,
  },
  categoryBtnDanger: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  categoryBtnBuddy: {
    backgroundColor: Colors.accentSecondary,
    borderColor: Colors.accentSecondary,
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryBtnTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#2D2D45',
    borderWidth: 1,
    borderColor: '#3C3C5C',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  contentInput: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 15,
    textAlign: 'right',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  submitBtn: {
    marginTop: 10,
  },
});

export default WritePostScreen; 