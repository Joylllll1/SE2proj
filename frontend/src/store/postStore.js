import { create } from 'zustand';
import * as postService from '../services/postService';
import { matchPostQuery } from '../utils/search';

function getKnownPostLikeState(state, postId) {
  if (state.likedPosts.includes(postId)) {
    return true;
  }

  const matchedPost = state.posts.find((post) => post.id === postId);
  if (matchedPost && typeof matchedPost.isLiked === 'boolean') {
    return matchedPost.isLiked;
  }

  if (state.selectedPost?.id === postId && typeof state.selectedPost.isLiked === 'boolean') {
    return state.selectedPost.isLiked;
  }

  return undefined;
}

function applyPostLikeState(state, postId, { liked, likes }) {
  return {
    likedPosts: liked
      ? [...new Set([...state.likedPosts, postId])]
      : state.likedPosts.filter((id) => id !== postId),
    posts: state.posts.map((p) =>
      p.id === postId ? { ...p, isLiked: liked, likes } : p,
    ),
    selectedPost:
      state.selectedPost?.id === postId
        ? { ...state.selectedPost, isLiked: liked, likes }
        : state.selectedPost,
  };
}

const usePostStore = create((set, get) => ({
  posts: [],
  likedPosts: [],
  selectedPost: null,
  loading: false,
  pendingUnlikePostIds: [],
  submittingUnlikePostIds: [],

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

  isPostPendingUnlike: (postId) => {
    const { pendingUnlikePostIds, submittingUnlikePostIds } = get();
    return pendingUnlikePostIds.includes(postId) || submittingUnlikePostIds.includes(postId);
  },

  isPostLiked: (postId) => {
    const { likedPosts } = get();
    return likedPosts.includes(postId) && !get().isPostPendingUnlike(postId);
  },

  getPostLikeView: (post) => {
    if (!post) return post;
    const isPendingUnlike = get().isPostPendingUnlike(post.id);
    const knownLikeState = getKnownPostLikeState(get(), post.id);
    const isLiked = typeof knownLikeState === 'boolean'
      ? knownLikeState
      : !!post.isLiked;
    return {
      ...post,
      isLiked: isPendingUnlike ? false : isLiked,
      likes: isPendingUnlike ? Math.max(0, (post.likes || 0) - 1) : (post.likes || 0),
    };
  },

  togglePendingUnlike: (postId) => {
    set((state) => ({
      pendingUnlikePostIds: state.pendingUnlikePostIds.includes(postId)
        ? state.pendingUnlikePostIds.filter((id) => id !== postId)
        : [...state.pendingUnlikePostIds, postId],
    }));
  },

  submitPendingUnlikes: async (postIds) => {
    const currentPending = get().pendingUnlikePostIds;
    const targetIds = [...new Set((postIds || currentPending).filter((id) => currentPending.includes(id)))];
    if (targetIds.length === 0) {
      return { succeeded: [], failed: [] };
    }

    set((state) => ({
      pendingUnlikePostIds: state.pendingUnlikePostIds.filter((id) => !targetIds.includes(id)),
      submittingUnlikePostIds: [...new Set([...state.submittingUnlikePostIds, ...targetIds])],
    }));

    const succeeded = [];
    const failed = [];

    for (const postId of targetIds) {
      try {
        const result = await postService.toggleLike(postId);
        succeeded.push({ postId, result });
      } catch (error) {
        failed.push({ postId, error });
      }
    }

    set((state) => {
      let nextState = {
        ...state,
        submittingUnlikePostIds: state.submittingUnlikePostIds.filter((id) => !targetIds.includes(id)),
      };

      for (const { postId, result } of succeeded) {
        nextState = {
          ...nextState,
          ...applyPostLikeState(nextState, postId, result),
        };
      }

      return nextState;
    });

    return {
      succeeded: succeeded.map(({ postId }) => postId),
      failed: failed.map(({ postId }) => postId),
    };
  },

  toggleLike: async (postId) => {
    if (get().isPostPendingUnlike(postId)) {
      set((state) => ({
        pendingUnlikePostIds: state.pendingUnlikePostIds.filter((id) => id !== postId),
      }));
      return;
    }

    const previousPosts = get().posts;
    const previousSelected = get().selectedPost;
    const previousLiked = get().likedPosts;
    const wasLiked = previousLiked.includes(postId);
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
      const result = await postService.toggleLike(postId);
      set((state) => applyPostLikeState(state, postId, result));
    } catch {
      // 完整回滚：防止 API 失败时 likedPosts 和 posts 不同步导致的计数偏移
      set({ posts: previousPosts, selectedPost: previousSelected, likedPosts: previousLiked });
    }
  },

  toggleSave: async (postId) => {
    const previousPosts = get().posts;
    const previousSelected = get().selectedPost;
    // Optimistic update
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, saves: p.isSaved ? p.saves - 1 : p.saves + 1, isSaved: !p.isSaved }
          : p,
      ),
      selectedPost:
        state.selectedPost?.id === postId
          ? {
              ...state.selectedPost,
              saves: state.selectedPost.isSaved
                ? state.selectedPost.saves - 1
                : state.selectedPost.saves + 1,
              isSaved: !state.selectedPost.isSaved,
            }
          : state.selectedPost,
    }));
    try {
      await postService.toggleSave(postId);
    } catch {
      // 完整回滚
      set({ posts: previousPosts, selectedPost: previousSelected });
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
    const postView = get().getPostLikeView(post);
    set({ selectedPost: postView });
  },

  getFilteredPosts: (query) => {
    const { posts } = get();
    return posts.filter((post) => matchPostQuery(post, query));
  },
}));

export default usePostStore;
