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
    set((state) => ({ posts: [newPost, ...state.posts] }));
    return newPost;
  },

  toggleLike: async (postId) => {
    const previous = get().likedPosts;
    // Optimistic update
    const wasLiked = previous.includes(postId);
    set((state) => ({
      likedPosts: wasLiked
        ? state.likedPosts.filter((id) => id !== postId)
        : [...state.likedPosts, postId],
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, likes: wasLiked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    }));
    try {
      await postService.toggleLike(postId);
    } catch {
      // Revert on error
      set({ likedPosts: previous });
    }
  },

  updateSaves: (postId, increment) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, saves: Math.max(0, p.saves + increment) } : p,
      ),
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

  setSelectedPost: (post) => set({ selectedPost: post }),

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
