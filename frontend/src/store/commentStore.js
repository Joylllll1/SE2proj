import { create } from 'zustand';
import { saveJSON } from '../utils';

function syncLoadComments() {
  try {
    const raw = localStorage.getItem('nju_comments');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

const useCommentStore = create((set, get) => ({
  commentsMap: syncLoadComments(),

  addComment: (postId, content, official = false) => {
    const { commentsMap } = get();
    const currentUserId = (() => {
      let uid = localStorage.getItem('nju_user_id');
      if (!uid) {
        uid = 'U-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        localStorage.setItem('nju_user_id', uid);
      }
      return uid;
    })();

    const newComment = {
      id: Date.now(),
      userId: official ? 'U-OFFICIAL' : currentUserId,
      content,
      time: '刚刚',
      likes: 0,
      official,
      replies: [],
    };
    const updated = {
      ...commentsMap,
      [postId]: [...(commentsMap[postId] || []), newComment],
    };
    set({ commentsMap: updated });
    saveJSON('nju_comments', updated);
    return newComment;
  },
}));

export default useCommentStore;
