import { create } from 'zustand';
import { loadJSON, saveJSON } from '../utils';

const SEED_NOTIFS = [
  { id: 'N-1', text: '你的帖子「杜厦图书馆五楼的夕阳」获得了 10 个新赞', time: '2分钟前', read: false },
  { id: 'N-2', text: '温柔的小蓝鲸 回复了你的评论', time: '15分钟前', read: false },
  { id: 'N-3', text: '校园音乐节 2026 报名即将截止，快来参加', time: '1小时前', read: true },
];

const useUiStore = create((set, get) => ({
  // Toast
  toast: null,
  // AI Panel
  aiOpen: false,
  // Notifications
  notifs: loadJSON('nju_notifs', SEED_NOTIFS),
  // Routing
  activePage: 'home',
  // Search
  query: '',
  // Carousel navigation
  eventToOpen: null,

  // Toast
  showToast: (msg) => {
    set({ toast: msg });
  },
  clearToast: () => set({ toast: null }),

  // AI Panel
  toggleAi: () => set((s) => ({ aiOpen: !s.aiOpen })),
  closeAi: () => set({ aiOpen: false }),

  // Notifications
  markAllNotifsRead: () => {
    const updated = get().notifs.map((n) => ({ ...n, read: true }));
    set({ notifs: updated });
    saveJSON('nju_notifs', updated);
  },
  addNotif: (text) => {
    const newNotif = { id: 'N-' + Date.now(), text, time: '刚刚', read: false };
    const updated = [newNotif, ...get().notifs];
    set({ notifs: updated });
    saveJSON('nju_notifs', updated);
  },

  // Routing
  navigate: (page) => set({ activePage: page }),

  // Search
  setQuery: (q) => set({ query: q }),

  // Event navigation
  openEventFromCarousel: (eventId) => {
    set({ eventToOpen: eventId, activePage: 'announcements' });
    setTimeout(() => set({ eventToOpen: null }), 100);
  },
}));

export default useUiStore;
