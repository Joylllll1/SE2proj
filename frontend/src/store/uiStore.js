import { create } from 'zustand';
import { loadJSON, saveJSON } from '../utils';

// ─── URL 映射表 ───
const PAGE_URLS = {
  home: '/',
  trending: '/trending',
  bookmarks: '/bookmarks',
  likes: '/likes',
  announcements: '/announcements',
  admin: '/admin',
  settings: '/settings',
  compose: '/compose',
  login: '/login',
  register: '/register',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
};

// 反向映射：URL → page name
function urlToPage(url) {
  const path = url.replace(/\/+$/, '') || '/';
  for (const [page, p] of Object.entries(PAGE_URLS)) {
    if (p === path) return page;
  }
  // 匹配 detail 页：/detail/:id
  if (/^\/detail\//.test(path)) return 'detail';
  return null;
}

// 从当前 URL 恢复 activePage
function getInitialPage() {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return urlToPage(path) || 'home';
}

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
  activePage: getInitialPage(),
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
  navigate: (page, params) => {
    let url;
    if (page === 'detail' && params?.selectedPost) {
      url = `/detail/${params.selectedPost.id}`;
    } else {
      url = PAGE_URLS[page];
    }
    if (url) {
      window.history.pushState({ page, params }, '', url);
    }
    set({ activePage: page, ...params });
  },
  handlePopState: () => {
    const page = urlToPage(window.location.pathname) || 'home';
    set({ activePage: page });
  },

  // Search
  setQuery: (q) => set({ query: q }),

  // Event navigation
  openEventFromCarousel: (eventId) => {
    set({ eventToOpen: eventId, activePage: 'announcements' });
    setTimeout(() => set({ eventToOpen: null }), 100);
  },
}));

export default useUiStore;
