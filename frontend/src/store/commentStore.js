import { create } from 'zustand';
import * as commentService from '../services/commentService';

const useCommentStore = create((set, get) => ({
  commentsMap: {},

  fetchComments: async (postId) => {
    try {
      const comments = await commentService.getComments(postId);
      set((state) => ({
        commentsMap: { ...state.commentsMap, [postId]: comments },
      }));
    } catch {
      // Silently fail — UI handles empty state
    }
  },

  addComment: async (postId, content, official = false) => {
    const comment = await commentService.createComment(postId, content, official);
    set((state) => {
      const existing = state.commentsMap[postId] || [];
      return {
        commentsMap: { ...state.commentsMap, [postId]: [...existing, comment] },
      };
    });
    return comment;
  },

  toggleLike: async (commentId) => {
    const previous = get().commentsMap;
    // Optimistic update: toggle isLiked immediately
    set((state) => {
      const updated = { ...state.commentsMap };
      for (const postId of Object.keys(updated)) {
        updated[postId] = updated[postId].map((c) =>
          c.id === commentId || c._id === commentId
            ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? Math.max(0, c.likes - 1) : c.likes + 1 }
            : c,
        );
      }
      return { commentsMap: updated };
    });
    // Then sync with the API
    try {
      await commentService.toggleLike(commentId);
    } catch {
      // Rollback on failure
      set({ commentsMap: previous });
    }
  },

  addReply: async (commentId, content, official = false) => {
    const reply = await commentService.addReply(commentId, content, official);
    set((state) => {
      const updated = { ...state.commentsMap };
      for (const postId of Object.keys(updated)) {
        updated[postId] = updated[postId].map((c) =>
          c.id === commentId || c._id === commentId
            ? { ...c, replies: [...(c.replies || []), reply] }
            : c,
        );
      }
      return { commentsMap: updated };
    });
    return reply;
  },

  getCommentsByPostId: (postId) => {
    return get().commentsMap[postId] || [];
  },
}));

export default useCommentStore;
