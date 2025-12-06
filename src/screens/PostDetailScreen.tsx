// src/screens/PostDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import boardService, { Post, Comment } from '../api/boardService';
import { getErrorMessage, isUnauthorizedError, isForbiddenError } from '../api/errors';
import PrimaryButton from '../components/PrimaryButton';
import { useProfile } from '../context/ProfileContext';  // ✅ 추가

interface PostDetailScreenProps {
  navigation: any;
  route: any;
}

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ navigation, route }) => {
  const { postId } = route.params;
  const { profileData } = useProfile();  // ✅ 현재 로그인한 사용자 정보
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ 게시글 작성자 확인 함수
  const isPostAuthor = () => {
    if (!post || !profileData.nickname) return false;
    const postAuthorNickname = (post as any).authorUser?.nickname;
    console.log('🔍 작성자 확인:', {
      currentUser: profileData.nickname,
      postAuthor: postAuthorNickname,
      isAuthor: profileData.nickname === postAuthorNickname
    });
    return profileData.nickname === postAuthorNickname;
  };

  // ✅ 댓글 작성자 확인 함수
  const isCommentAuthor = (comment: Comment) => {
    if (!profileData.nickname) return false;
    const commentAuthorNickname = (comment as any).authorUser?.nickname;
    return profileData.nickname === commentAuthorNickname;
  };

  useEffect(() => {
    loadPost();
  }, [postId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPost();
    });

    return unsubscribe;
  }, [navigation, postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const data: any = await boardService.getPost(postId);
      
      setPost(data);
      setComments(data.comments || []);
    } catch (error: any) {
      console.error('게시글 로드 실패:', error);
      Alert.alert('오류', getErrorMessage(error));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = () => {
    // ✅ 작성자 확인
    if (!isPostAuthor()) {
      Alert.alert('권한 없음', '본인의 게시글만 삭제할 수 있습니다.');
      return;
    }

    Alert.alert('게시글 삭제', '정말 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await boardService.deletePost(postId);
            Alert.alert('성공', '게시글이 삭제되었습니다.');
            navigation.navigate('Main', {
              screen: '커뮤니티',
              params: {
                action: 'delete',
                deletedPostId: postId,
                timestamp: Date.now(),
              },
            });
          } catch (error: any) {
            if (isForbiddenError(error)) {
              Alert.alert('권한 없음', '본인의 게시글만 삭제할 수 있습니다.');
            } else {
              Alert.alert('삭제 실패', getErrorMessage(error));
            }
          }
        },
      },
    ]);
  };

  const handleEditPost = () => {
    // ✅ 작성자 확인
    if (!isPostAuthor()) {
      Alert.alert('권한 없음', '본인의 게시글만 수정할 수 있습니다.');
      return;
    }

    navigation.navigate('WritePost', {
      mode: 'edit',
      post: post,
      postId: post?.id,
    });
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('알림', '댓글 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await boardService.createComment(postId, {
        content: commentText.trim(),
        parentId: replyingTo,
      });

      await loadPost();

      setCommentText('');
      setReplyingTo(null);
      Alert.alert('성공', '댓글이 작성되었습니다.');
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
        Alert.alert('로그인 필요', '로그인 후 댓글을 작성할 수 있습니다.');
      } else {
        Alert.alert('댓글 작성 실패', getErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (comment: Comment) => {
    // ✅ 댓글 작성자 확인
    if (!isCommentAuthor(comment)) {
      Alert.alert('권한 없음', '본인의 댓글만 삭제할 수 있습니다.');
      return;
    }

    Alert.alert('댓글 삭제', '정말 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await boardService.deleteComment(comment.id);
            await loadPost();
            Alert.alert('성공', '댓글이 삭제되었습니다.');
          } catch (error: any) {
            if (isForbiddenError(error)) {
              Alert.alert('권한 없음', '본인의 댓글만 삭제할 수 있습니다.');
            } else {
              Alert.alert('삭제 실패', getErrorMessage(error));
            }
          }
        },
      },
    ]);
  };

  const handleReply = (commentId: number, authorName: string) => {
    setReplyingTo(commentId);
    setCommentText(`@${authorName} `);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setCommentText('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      free: styles.tagFree,
      inquiry: styles.tagInquiry,
      report: styles.tagReport,
    };
    return map[category] || styles.tagFree;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>게시글을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <FontAwesome5 name="exclamation-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>게시글을 찾을 수 없습니다.</Text>
          <PrimaryButton title="돌아가기" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시글</Text>
        {/* ✅ 작성자일 때만 수정/삭제 버튼 표시 */}
        <View style={styles.headerActions}>
          {isPostAuthor() ? (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handleEditPost}>
                <FontAwesome5 name="edit" size={18} color={Colors.accentPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleDeletePost}>
                <FontAwesome5 name="trash" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.postCard}>
            <Text style={[styles.categoryTag, getCategoryStyle(post.category)]}>
              {getCategoryText(post.category)}
            </Text>

            <Text style={styles.postTitle}>{post.title}</Text>

            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <FontAwesome5 name="user-circle" size={20} color={Colors.accentPrimary} />
              </View>
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{(post as any).authorUser?.nickname || 'Unknown'}</Text>
                <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
              </View>
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            <View style={styles.postStats}>
              <View style={styles.statItem}>
                <FontAwesome5 name="comment" size={14} color={Colors.textSecondary} />
                <Text style={styles.statText}>{(post as any)._count?.comments || 0}</Text>
              </View>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsHeader}>
              댓글 {comments.length}개
            </Text>

            {comments.length === 0 ? (
              <View style={styles.emptyComments}>
                <FontAwesome5 name="comment-slash" size={40} color={Colors.textSecondary} />
                <Text style={styles.emptyCommentsText}>
                  아직 댓글이 없습니다.{'\n'}첫 번째 댓글을 작성해보세요!
                </Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View key={comment.id}>
                  <View style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentAuthor}>
                        <FontAwesome5 name="user-circle" size={16} color="#B9D9EB" />
                        <Text style={styles.commentAuthorName}>{(comment as any).authorUser?.nickname || 'Unknown'}</Text>
                      </View>
                      <View style={styles.commentActions}>
                        <TouchableOpacity
                          onPress={() => handleReply(comment.id, (comment as any).authorUser?.nickname || 'Unknown')}
                        >
                          <FontAwesome5 name="reply" size={14} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        {/* ✅ 댓글 작성자일 때만 삭제 버튼 표시 */}
                        {isCommentAuthor(comment) && (
                          <TouchableOpacity onPress={() => handleDeleteComment(comment)}>
                            <FontAwesome5 name="trash" size={14} color={Colors.danger} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                    <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                  </View>

                  {comment.replies && comment.replies.length > 0 && (
                    <View style={styles.repliesContainer}>
                      {comment.replies.map((reply) => (
                        <View key={reply.id} style={styles.replyCard}>
                          <FontAwesome5
                            name="reply"
                            size={12}
                            color={Colors.textSecondary}
                            style={styles.replyIcon}
                          />
                          <View style={{ flex: 1 }}>
                            <View style={styles.commentHeader}>
                              <View style={styles.commentAuthor}>
                                <FontAwesome5 name="user-circle" size={14} color="#B9D9EB" />
                                <Text style={styles.replyAuthorName}>{(reply as any).authorUser?.nickname || 'Unknown'}</Text>
                              </View>
                              {/* ✅ 답글 작성자일 때만 삭제 버튼 표시 */}
                              {isCommentAuthor(reply) && (
                                <TouchableOpacity onPress={() => handleDeleteComment(reply)}>
                                  <FontAwesome5 name="trash" size={12} color={Colors.danger} />
                                </TouchableOpacity>
                              )}
                            </View>
                            <Text style={styles.replyContent}>{reply.content}</Text>
                            <Text style={styles.replyDate}>{formatDate(reply.createdAt)}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.commentInputContainer}>
          {replyingTo && (
            <View style={styles.replyingToBar}>
              <Text style={styles.replyingToText}>답글 작성 중...</Text>
              <TouchableOpacity onPress={cancelReply}>
                <FontAwesome5 name="times" size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.commentInputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder="댓글을 입력하세요..."
              placeholderTextColor={Colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <FontAwesome5 name="paper-plane" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  postCard: {
    backgroundColor: Colors.bgCard,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 15,
  },
  tagFree: {
    backgroundColor: Colors.accentPrimary,
    color: 'white',
  },
  tagInquiry: {
    backgroundColor: Colors.danger,
    color: 'white',
  },
  tagReport: {
    backgroundColor: Colors.accentSecondary,
    color: 'white',
  },
  postTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 15,
    lineHeight: 32,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(106, 137, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  postDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  postContent: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 20,
  },
  postStats: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  commentsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  commentsHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 15,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accentPrimary,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCommentsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  commentCard: {
    backgroundColor: Colors.bgCard,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B9D9EB',
  },
  commentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  commentContent: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 6,
  },
  commentDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  repliesContainer: {
    marginLeft: 20,
    marginBottom: 10,
  },
  replyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(45, 45, 69, 0.5)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  replyIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  replyAuthorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B9D9EB',
  },
  replyContent: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  replyDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  commentInputContainer: {
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  replyingToBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(106, 137, 255, 0.1)',
  },
  replyingToText: {
    fontSize: 12,
    color: Colors.accentPrimary,
  },
  commentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#2D2D45',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    maxHeight: 100,
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
});

export default PostDetailScreen;