import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import HomePage from './HomePage';
import useAuthStore from '../../store/authStore';
import usePostStore from '../../store/postStore';
import useUiStore from '../../store/uiStore';
import * as postService from '../../services/postService';

vi.mock('../../services/postService', () => ({
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

vi.mock('../common/Icon', () => ({
  default: () => <span data-testid="icon" />,
}));

vi.mock('../features/HeroCarousel', () => ({
  default: () => <div data-testid="hero-carousel" />,
}));

vi.mock('../common/PostCard', () => ({
  default: ({ post }) => <div>{post.title}</div>,
}));

vi.mock('../common/EmptyState', () => ({
  default: ({ title }) => <div>{title}</div>,
}));

vi.mock('../features/DailyFortune', () => ({
  default: () => <div data-testid="daily-fortune" />,
}));

vi.mock('../../hooks/usePostActions', () => ({
  default: () => ({ openPost: vi.fn() }),
}));

vi.mock('../../hooks/useLikeBookmark', () => ({
  default: () => ({ toggleLike: vi.fn(), toggleBookmark: vi.fn() }),
}));

class MockEventSource {
  static instances = [];

  constructor(url) {
    this.url = url;
    this.listeners = new Map();
    this.close = vi.fn();
    MockEventSource.instances.push(this);
  }

  addEventListener(event, handler) {
    this.listeners.set(event, handler);
  }

  emit(event, data = {}) {
    const handler = this.listeners.get(event);
    if (handler) {
      handler({ data: JSON.stringify(data) });
    }
  }
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const existingPosts = [
  {
    id: 'post-1',
    title: 'Existing post',
    content: 'content',
    createdAt: '2026-05-26T00:00:00.000Z',
    tags: ['树洞'],
    likes: 0,
    comments: 0,
    saves: 0,
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-2',
    title: 'Second post',
    content: 'content',
    createdAt: '2026-05-26T00:00:00.000Z',
    tags: ['树洞'],
    likes: 0,
    comments: 0,
    saves: 0,
    isLiked: false,
    isSaved: false,
  },
];

describe('HomePage SSE updates', () => {
  beforeEach(() => {
    useAuthStore.setState(useAuthStore.getInitialState(), true);
    usePostStore.setState(usePostStore.getInitialState(), true);
    useUiStore.setState(useUiStore.getInitialState(), true);
    MockEventSource.instances = [];
    vi.clearAllMocks();

    globalThis.EventSource = MockEventSource;

    useAuthStore.setState({
      user: { _id: 'user-1' },
      accessToken: 'token-1',
      isAuthenticated: true,
    });
    useUiStore.setState({
      query: '',
      navigate: vi.fn(),
      showToast: vi.fn(),
    });
    usePostStore.setState({
      posts: existingPosts,
      likedPosts: [],
      loading: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('keeps the existing list visible while an SSE refresh is in flight', async () => {
    const deferred = createDeferred();
    postService.fetchPosts
      .mockResolvedValueOnce({ posts: existingPosts })
      .mockReturnValueOnce(deferred.promise);

    render(<HomePage />);

    expect(await screen.findByText('Existing post')).toBeInTheDocument();
    MockEventSource.instances[0].emit('new-post', {});

    expect(screen.getByText('Existing post')).toBeInTheDocument();
    expect(screen.queryByText('加载中...')).not.toBeInTheDocument();

    deferred.resolve({ posts: existingPosts });
    await waitFor(() => {
      expect(postService.fetchPosts).toHaveBeenCalledTimes(2);
    });
  });

  it('removes a deleted post when post-deleted SSE arrives', async () => {
    postService.fetchPosts.mockResolvedValueOnce({ posts: existingPosts });

    render(<HomePage />);

    expect(await screen.findByText('Existing post')).toBeInTheDocument();
    expect(screen.getByText('Second post')).toBeInTheDocument();

    MockEventSource.instances[0].emit('post-deleted', { postId: 'post-1' });

    await waitFor(() => {
      expect(screen.queryByText('Existing post')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Second post')).toBeInTheDocument();
  });
});
