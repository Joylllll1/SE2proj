import { create } from 'zustand';
import { saveJSON } from '../utils';

const SEED_COMMENTS = {
  'P-4921': [
    {
      id: 5928763,
      userId: 'U-SEED05',
      content: '插座问题确实该修了，上次我带了充电宝才敢去，五楼真的太难抢位置了。',
      time: '1小时前', likes: 24, official: false,
      replies: [
        { id: 5928764, userId: 'U-SEED06', content: '同感，建议早点去四楼，四楼插座好一点，就是没那么安静。', time: '45分钟前', likes: 5 },
      ],
    },
    {
      id: 5928765,
      userId: 'U-OFFICIAL',
      content: '感谢反馈，我们已记录您的建议。后勤部门会在本周末对五楼插座与空调进行集中排查和维护。',
      time: '30分钟前', likes: 89, official: true,
      replies: [],
    },
  ],
};

function syncLoadComments() {
  try {
    const raw = localStorage.getItem('nju_comments');
    return raw ? JSON.parse(raw) : SEED_COMMENTS;
  } catch { return SEED_COMMENTS; }
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
