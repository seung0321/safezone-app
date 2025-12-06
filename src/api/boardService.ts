// src/api/boardService.ts
import { apiRequest } from './config';

export interface Post {
  id: number;
  title: string;
  content: string;
  category: 'free' | 'inquiry' | 'report';
  userId: number;
  authorUser: {
    id: number;
    nickname: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
  };
}

export interface Comment {
  id: number;
  bordId: number;
  userId: number;
  content: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  authorUser: {
    id: number;
    nickname: string;
  };
  replies?: Comment[];
}

export interface PostListParams {
  page?: number;
  pageSize?: number;
  category?: 'free' | 'inquiry' | 'report';
  searchType?: 'title' | 'content' | 'title_content' | 'author';
  keyword?: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: 'free' | 'inquiry' | 'report';
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  category?: 'free' | 'inquiry' | 'report';
}

export interface CreateCommentData {
  content: string;
  parentId?: number | null;
}

export interface UpdateCommentData {
  content: string;
}

class BoardService {
  /**
   * 게시글 목록 조회
   */
  async getPosts(params: PostListParams = {}): Promise<{
    posts: Post[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.searchType) queryParams.append('searchType', params.searchType);
    if (params.keyword) queryParams.append('keyword', params.keyword);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/bords?${queryString}` : '/bords';

    console.log('📤 게시글 조회 요청:', endpoint);

    const response = await apiRequest(endpoint, {
      method: 'GET',
    });

    return {
      posts: response.items || [],
      total: response.totalCount || 0,
      page: response.page || 1,
      pageSize: response.pageSize || 10,
    };
  }

  /**
   * 게시글 상세 조회
   */
  async getPost(postId: number): Promise<Post & { comments: Comment[] }> {
    return await apiRequest(`/bords/${postId}`, {
      method: 'GET',
    });
  }

  /**
   * 게시글 작성
   */
  async createPost(data: CreatePostData): Promise<Post> {
    console.log('📤 게시글 작성 요청:', data);
    
    return await apiRequest('/bords', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 게시글 수정
   */
  async updatePost(postId: number, data: UpdatePostData): Promise<Post> {
    console.log('📤 게시글 수정 요청:', postId, data);
    
    return await apiRequest(`/bords/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * 게시글 삭제
   */
  async deletePost(postId: number): Promise<void> {
    await apiRequest(`/bords/${postId}`, {
      method: 'DELETE',
    });
  }

  /**
   * 댓글 목록 조회
   */
  async getComments(postId: number): Promise<Comment[]> {
    const post = await this.getPost(postId);
    return post.comments || [];
  }

  /**
   * 댓글 작성
   */
  async createComment(postId: number, data: CreateCommentData): Promise<Comment> {
    return await apiRequest(`/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 댓글 수정
   */
  async updateComment(commentId: number, data: UpdateCommentData): Promise<Comment> {
    return await apiRequest(`/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * 댓글 삭제
   */
  async deleteComment(commentId: number): Promise<void> {
    await apiRequest(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }
}

export default new BoardService();