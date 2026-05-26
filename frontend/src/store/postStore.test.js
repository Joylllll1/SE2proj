import { beforeEach, describe, expect, it, vi } from 'vitest';
import usePostStore from './postStore';
import * as postService from '../services/postService';

vi.mock('../services/postService', () => ({
  fetchPosts: vi.fn(),
  fetchPostById: vi.fn(),
  createPost: vi.fn(),
  deletePost: vi.fn(),
  toggleLike: vi.fn(),
  toggleSave: vi.fn(),
  fetchLikes: vi.fn(),
  fetchSavedPosts: vi.fn(),
  fetchMyPosts: vi.fn(),
  toggleCommentLike: vi.fn(),
  toggleReplyLike: vi.fn(),
}));

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('postStore fetchPosts', () => {
  beforeEach(() => {
    usePostStore.setState(usePostStore.getInitialState(), true);
    vi.clearAllMocks();
  });

  it('shows loading only for the first page load', async () => {
    const deferred = createDeferred();
    postService.fetchPosts.mockReturnValueOnce(deferred.promise);

    const request = usePostStore.getState().fetchPosts();

    expect(usePostStore.getState().loading).toBe(true);

    deferred.resolve({
      posts: [{ id: 'post-1', title: 'First post', isLiked: false }],
    });
    await request;

    expect(usePostStore.getState().loading).toBe(false);
    expect(usePostStore.getState().posts).toEqual([
      { id: 'post-1', title: 'First post', isLiked: false },
    ]);
  });
});
