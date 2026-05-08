import { create } from 'zustand';
import { loadJSON, saveJSON } from '../utils';
import * as postService from '../services/postService';

const SEED_POSTS = [
  {
    id: 'P-4921',
    ownerUserId: 'U-SEED01',
    time: '12分钟前',
    campus: '仙林校区',
    title: '杜厦图书馆五楼的夕阳',
    content: '今天刚好赶在闭馆前完成了一篇难啃的论文，走出大楼那一刻吹着晚风，感觉所有的焦虑都消失了。生活不仅有 DDL，还有此刻的晚霞。',
    mood: '宁静', moodType: 'calm',
    likes: 124, comments: 32, saves: 18,
    tags: ['杜厦图书馆', '考研倒计时'],
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'P-8820',
    ownerUserId: 'U-SEED02', time: '45分钟前',
    campus: '鼓楼校区',
    title: '保研面试前的自我怀疑',
    content: '这周就要保研面试了，每天都在疯狂刷题。可是看着周围厉害的大佬，总觉得自己还不够好。有没有学长学姐分享一下当年跨过这个阶段的心情？',
    mood: '焦虑', moodType: 'anxious',
    likes: 88, comments: 56, saves: 41,
    tags: ['保研', '求建议'],
  },
  {
    id: 'P-2105',
    ownerUserId: 'U-SEED03', time: '2小时前',
    campus: '仙林校区',
    title: '六食堂门口的三花猫',
    content: '在六食堂偶遇了一只超级粘人的三花猫。它在台阶上晒太阳，看到人走近还会慢慢伸懒腰。今天的好运被承包了。',
    mood: '快乐', moodType: 'happy',
    likes: 2400, comments: 412, saves: 206,
    tags: ['校园猫', '校园生活'],
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'P-1020',
    ownerUserId: 'U-SEED04', time: '5小时前',
    campus: '仙林校区',
    title: '实验又失败了',
    content: '感觉自己像是在无尽的黑夜里行走。明明很努力，但结果总是不尽如人意。有没有人也在这个点还没睡？',
    mood: '忧伤', moodType: 'sad',
    likes: 512, comments: 89, saves: 77,
    tags: ['科研日常', '情绪树洞'],
  },
];

function syncLoadPosts() {
  try {
    const raw = localStorage.getItem('nju_posts');
    return raw ? JSON.parse(raw) : SEED_POSTS;
  } catch { return SEED_POSTS; }
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
