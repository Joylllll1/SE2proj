import { create } from 'zustand';
import * as ratingService from '../services/ratingService';
import { flattenRatingComments } from '../utils/ratingComments';

function sortTopicsByScore(topics) {
  return [...topics].sort((a, b) => {
    const scoreA = a.averageScore || 0;
    const scoreB = b.averageScore || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (a.title || '').localeCompare(b.title || '', 'zh-CN');
  });
}

const useRatingStore = create((set, get) => ({
  themes: [],
  listLoading: false,
  listTotal: 0,
  creatingTheme: false,

  myThemes: [],
  myThemesLoading: false,

  themeDetail: null,
  themeTopics: [],
  themeDetailLoading: false,
  themeDeletedAt: 0,

  topics: [],
  myTopics: [],
  myTopicsLoading: false,
  creatingTopic: false,
  togglingTopicLike: false,

  detail: null,
  detailTheme: null,
  stats: null,
  userRating: null,
  relatedTags: [],
  comments: [],
  commentsTotal: 0,
  detailLoading: false,
  submittingRating: false,
  submittingComment: false,

  fetchThemes: async (page = 1, query = '') => {
    set({ listLoading: true });
    try {
      const data = await ratingService.fetchThemes(page, 20, query);
      set({
        themes: data.items || [],
        listTotal: data.total || 0,
        listLoading: false,
      });
      return data;
    } catch {
      set({ listLoading: false });
      return { items: [], total: 0 };
    }
  },

  fetchMyThemes: async (page = 1) => {
    set({ myThemesLoading: true });
    try {
      const data = await ratingService.fetchMyThemes(page, 20);
      set({
        myThemes: data.items || [],
        myThemesLoading: false,
      });
      return data;
    } catch (err) {
      set({ myThemesLoading: false });
      throw err;
    }
  },

  createTheme: async (payload) => {
    set({ creatingTheme: true });
    try {
      const theme = await ratingService.createTheme(payload);
      set({ creatingTheme: false });
      return theme;
    } catch (err) {
      set({ creatingTheme: false });
      throw err;
    }
  },

  fetchThemeDetail: async (themeId) => {
    set({ themeDetailLoading: true });
    try {
      const data = await ratingService.fetchThemeDetail(themeId);
      set({
        themeDetail: data.theme,
        themeTopics: data.topics || [],
        themeDetailLoading: false,
      });
      return data;
    } catch (err) {
      set({ themeDetailLoading: false });
      throw err;
    }
  },

  deleteTheme: async (themeId) => {
    await ratingService.deleteTheme(themeId);
    set((state) => ({
      myThemes: state.myThemes.filter((t) => t.id !== themeId),
      themes: state.themes.filter((t) => t.id !== themeId),
      myTopics: state.myTopics.filter((t) => t.themeId !== themeId),
      topics: state.topics.filter((t) => t.themeId !== themeId),
      themeTopics:
        state.themeDetail?.id === themeId
          ? []
          : state.themeTopics.filter((t) => t.themeId !== themeId),
      themeDetail: state.themeDetail?.id === themeId ? null : state.themeDetail,
      themeDeletedAt: Date.now(),
    }));
  },

  clearThemeDetail: () => {
    set({ themeDetail: null, themeTopics: [] });
  },

  fetchMyTopics: async (page = 1) => {
    set({ myTopicsLoading: true });
    try {
      const data = await ratingService.fetchMyTopics(page, 20);
      set({
        myTopics: data.items || [],
        myTopicsLoading: false,
      });
      return data;
    } catch (err) {
      set({ myTopicsLoading: false });
      throw err;
    }
  },

  deleteTopic: async (topicId) => {
    await ratingService.deleteTopic(topicId);
    set((state) => ({
      myTopics: state.myTopics.filter((t) => t.id !== topicId),
      themeTopics: sortTopicsByScore(state.themeTopics.filter((t) => t.id !== topicId)),
    }));
  },

  applyTopicLikeUpdate: (topicId, { likes, isLiked }) => {
    set((state) => {
      const prevTopic = state.themeTopics.find((t) => t.id === topicId)
        || (state.detail?.id === topicId ? state.detail : null)
        || state.themes.map((t) => t.previewTopic).find((t) => t?.id === topicId);
      const prevLikes = prevTopic?.likes ?? likes;
      const delta = likes - prevLikes;
      const themeId = prevTopic?.themeId
        || state.detail?.themeId
        || state.themes.find((t) => t.previewTopic?.id === topicId)?.id;

      const patchTopic = (topic) => (
        topic.id === topicId ? { ...topic, likes, isLiked } : topic
      );

      const patchTheme = (theme) => {
        if (themeId && theme.id === themeId && delta !== 0) {
          return {
            ...theme,
            totalLikes: Math.max(0, (theme.totalLikes || 0) + delta),
            previewTopic: theme.previewTopic?.id === topicId
              ? { ...theme.previewTopic, likes, isLiked }
              : theme.previewTopic,
          };
        }
        if (theme.previewTopic?.id === topicId) {
          return {
            ...theme,
            previewTopic: { ...theme.previewTopic, likes, isLiked },
          };
        }
        return theme;
      };

      return {
        themeTopics: state.themeTopics.map(patchTopic),
        myTopics: state.myTopics.map(patchTopic),
        themes: state.themes.map(patchTheme),
        themeDetail: themeId && state.themeDetail?.id === themeId && delta !== 0
          ? { ...state.themeDetail, totalLikes: Math.max(0, (state.themeDetail.totalLikes || 0) + delta) }
          : state.themeDetail,
        detail: state.detail?.id === topicId
          ? { ...state.detail, likes, isLiked }
          : state.detail,
      };
    });
  },

  applyTopicStatsUpdate: (topicId, stats) => {
    if (!stats) return;
    const patchTopic = (topic) => (
      topic.id === topicId
        ? {
            ...topic,
            averageScore: stats.averageScore,
            totalCount: stats.totalCount,
          }
        : topic
    );

    set((state) => ({
      stats: state.detail?.id === topicId ? stats : state.stats,
      themeTopics: sortTopicsByScore(state.themeTopics.map(patchTopic)),
      detail: state.detail?.id === topicId
        ? { ...state.detail, averageScore: stats.averageScore, totalCount: stats.totalCount }
        : state.detail,
    }));
  },

  toggleTopicLike: async (topicId) => {
    set({ togglingTopicLike: true });
    try {
      const result = await ratingService.toggleTopicLike(topicId);
      get().applyTopicLikeUpdate(topicId, result);
      set({ togglingTopicLike: false });
      return result;
    } catch (err) {
      set({ togglingTopicLike: false });
      throw err;
    }
  },

  createTopic: async (payload) => {
    set({ creatingTopic: true });
    try {
      const topic = await ratingService.createTopic(payload);
      set({ creatingTopic: false });
      return topic;
    } catch (err) {
      set({ creatingTopic: false });
      throw err;
    }
  },

  fetchDetail: async (topicId) => {
    set({ detailLoading: true });
    try {
      const [detailData, commentsData] = await Promise.all([
        ratingService.fetchRatingDetail(topicId),
        ratingService.fetchRatingComments(topicId),
      ]);
      set({
        detail: detailData.topic,
        detailTheme: detailData.theme || null,
        stats: detailData.stats,
        userRating: detailData.userRating,
        relatedTags: detailData.relatedTags || [],
        comments: commentsData.comments || [],
        commentsTotal: commentsData.total || 0,
        detailLoading: false,
      });
      return detailData;
    } catch (err) {
      set({ detailLoading: false });
      throw err;
    }
  },

  submitRating: async (topicId, stars) => {
    set({ submittingRating: true });
    try {
      const data = await ratingService.submitRating(topicId, stars);
      set({
        stats: data.stats,
        userRating: data.userRating,
        submittingRating: false,
      });
      get().applyTopicStatsUpdate(topicId, data.stats);
      return data;
    } catch (err) {
      set({ submittingRating: false });
      throw err;
    }
  },

  addComment: async (topicId, content) => {
    set({ submittingComment: true });
    try {
      const comment = await ratingService.createRatingComment(topicId, content);
      set((state) => ({
        comments: [comment, ...state.comments],
        commentsTotal: state.commentsTotal + 1,
        submittingComment: false,
      }));
      return comment;
    } catch (err) {
      set({ submittingComment: false });
      throw err;
    }
  },

  toggleCommentLike: async (commentId) => {
    const result = await ratingService.toggleRatingCommentLike(commentId);
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === commentId ? { ...c, likes: result.likes, isLiked: result.isLiked } : c,
      ),
    }));
    return result;
  },

  addReply: async (commentId, content, replyToId = null) => {
    const reply = await ratingService.addRatingReply(commentId, content, replyToId);
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === commentId ? { ...c, replies: [...(c.replies || []), reply] } : c,
      ),
    }));
    return reply;
  },

  toggleReplyLike: async (commentId, replyId) => {
    const result = await ratingService.toggleRatingReplyLike(commentId, replyId);
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: (c.replies || []).map((r) =>
                r.id === replyId ? { ...r, likes: result.likes, isLiked: result.isLiked } : r,
              ),
            }
          : c,
      ),
    }));
    return result;
  },

  getFlatComments: () => flattenRatingComments(get().comments),

  applyStatsUpdate: (stats) => {
    if (stats) set({ stats });
  },

  clearDetail: () => {
    set({
      detail: null,
      detailTheme: null,
      stats: null,
      userRating: null,
      relatedTags: [],
      comments: [],
      commentsTotal: 0,
    });
  },
}));

export default useRatingStore;
