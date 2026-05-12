import { create } from 'zustand';
import * as postService from '../services/postService';

const usePostStore = create((set, get) => ({
  posts: [],
  likedPosts: [],
  selectedPost: null,
  loading: false,

  fetchPosts: async (page = 1, query = '') => {
    set({ loading: true });
    try {
      const data = await postService.fetchPosts(page, query);
      set({
        posts: data.posts,
        likedPosts: data.posts.filter((p) => p.isLiked).map((p) => p.id),
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  addPost: async (post) => {
    const newPost = await postService.createPost(post);
    const normalized = { ...newPost, id: newPost.id || newPost._id?.toString() };
    set((state) => ({ posts: [normalized, ...state.posts] }));
    return normalized;
  },

  toggleLike: async (postId) => {
    const previous = get().likedPosts;
    const wasLiked = previous.includes(postId);
    set((state) => {
      const updatedPosts = state.posts.map((p) =>
        p.id === postId
          ? { ...p, likes: wasLiked ? p.likes - 1 : p.likes + 1, isLiked: !wasLiked }
          : p,
      );
      return {
        likedPosts: wasLiked
          ? state.likedPosts.filter((id) => id !== postId)
          : [...state.likedPosts, postId],
        posts: updatedPosts,
        selectedPost:
          state.selectedPost?.id === postId
            ? {
                ...state.selectedPost,
                likes: wasLiked
                  ? state.selectedPost.likes - 1
                  : state.selectedPost.likes + 1,
                isLiked: !wasLiked,
              }
            : state.selectedPost,
      };
    });
    try {
      await postService.toggleLike(postId);
    } catch {
      set({ likedPosts: previous });
    }
  },

  updateSaves: (postId, increment) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, saves: Math.max(0, p.saves + increment) } : p,
      ),
      selectedPost:
        state.selectedPost?.id === postId
          ? {
              ...state.selectedPost,
              saves: Math.max(0, state.selectedPost.saves + increment),
            }
          : state.selectedPost,
    }));
  },

  updateCommentCount: (postId, increment) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, comments: Math.max(0, p.comments + increment) }
          : p,
      ),
    }));
  },

  setSelectedPost: (post) => {
    const likedPosts = get().likedPosts;
    set({ selectedPost: { ...post, isLiked: likedPosts.includes(post.id) } });
  },

  getFilteredPosts: (query) => {
    const { posts } = get();
    if (!query || !query.trim()) return posts;
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const text = `${p.title} ${p.content} ${(p.tags || []).join(' ')}`.toLowerCase();
      return text.includes(q);
    });
  },
}));

export default usePostStore;
