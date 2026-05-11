import { create } from 'zustand';
import { loadJSON, saveJSON } from '../utils';
import * as postService from '../services/postService';

function syncLoadPosts() {
  try {
    const raw = localStorage.getItem('nju_posts');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function syncLoadLiked() {
  try {
    const raw = localStorage.getItem('nju_liked');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

const usePostStore = create((set, get) => ({
  posts: syncLoadPosts(),
  likedPosts: syncLoadLiked(),
  selectedPost: null,

  addPost: (post) => {
    const newPost = {
      ...post,
      id: 'P-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      ownerUserId: (() => {
        let uid = localStorage.getItem('nju_user_id');
        if (!uid) {
          uid = 'U-' + Math.random().toString(36).slice(2, 8).toUpperCase();
          localStorage.setItem('nju_user_id', uid);
        }
        return uid;
      })(),
      time: '刚刚',
      likes: 0, comments: 0, saves: 0,
    };
    const updated = [newPost, ...get().posts];
    set({ posts: updated });
    saveJSON('nju_posts', updated);
    postService.persistPosts(updated); // also persist via service
    return newPost;
  },

  toggleLike: (postId) => {
    const { likedPosts, posts } = get();
    const isLiked = likedPosts.includes(postId);
    const newLiked = isLiked
      ? likedPosts.filter((id) => id !== postId)
      : [...likedPosts, postId];
    const newPosts = posts.map((p) =>
      p.id === postId
        ? { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 }
        : p,
    );
    set({ likedPosts: newLiked, posts: newPosts });
    saveJSON('nju_liked', newLiked);
    saveJSON('nju_posts', newPosts);
  },

  updateSaves: (postId, increment) => {
    const newPosts = get().posts.map((p) =>
      p.id === postId ? { ...p, saves: Math.max(0, p.saves + increment) } : p,
    );
    set({ posts: newPosts });
    saveJSON('nju_posts', newPosts);
  },

  updateCommentCount: (postId, increment) => {
    const newPosts = get().posts.map((p) =>
      p.id === postId
        ? { ...p, comments: Math.max(0, p.comments + increment) }
        : p,
    );
    set({ posts: newPosts });
    saveJSON('nju_posts', newPosts);
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
