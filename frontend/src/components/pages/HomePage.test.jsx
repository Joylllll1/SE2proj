import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import HomePage from './HomePage';
import useAuthStore from '../../store/authStore';
import usePostStore from '../../store/postStore';
import useUiStore from '../../store/uiStore';

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

const sortablePosts = [
  {
    id: 'post-1',
    title: 'Older high-like post',
    content: 'content',
    createdAt: '2026-05-24T00:00:00.000Z',
    tags: ['树洞'],
    likes: 10,
    comments: 0,
    saves: 0,
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-2',
    title: 'Newest low-like post',
    content: 'content',
    createdAt: '2026-05-26T00:00:00.000Z',
    tags: ['树洞'],
    likes: 1,
    comments: 0,
    saves: 0,
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post-3',
    title: 'Newest tie-break winner',
    content: 'content',
    createdAt: '2026-05-27T00:00:00.000Z',
    tags: ['树洞'],
    likes: 10,
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

    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
    useUiStore.setState({
      query: '',
      navigate: vi.fn(),
      showToast: vi.fn(),
    });
    usePostStore.setState({
      fetchPosts: vi.fn().mockResolvedValue(undefined),
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

  it('keeps the existing list visible during a silent refresh', async () => {
    render(<HomePage />);

    expect(screen.getByText('Existing post')).toBeInTheDocument();
    expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
  });

  it('fetches posts on first mount', () => {
    const fetchPosts = vi.fn().mockResolvedValue(undefined);
    usePostStore.setState({
      posts: [],
      loading: false,
      fetchPosts,
    });

    render(<HomePage />);

    expect(fetchPosts).toHaveBeenCalledTimes(1);
  });

  it('removes a deleted post when store removes it', async () => {
    render(<HomePage />);

    expect(screen.getByText('Existing post')).toBeInTheDocument();
    expect(screen.getByText('Second post')).toBeInTheDocument();

    usePostStore.getState().removePostById('post-1');

    await waitFor(() => {
      expect(screen.queryByText('Existing post')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Second post')).toBeInTheDocument();
  });

  it('sorts by newest by default and reorders by likes when switching tabs', () => {
    usePostStore.setState({
      posts: sortablePosts,
      likedPosts: [],
      loading: false,
    });

    render(<HomePage />);

    let renderedTitles = screen.getAllByText(/post|winner/i).map((node) => node.textContent);
    expect(renderedTitles).toEqual([
      'Newest tie-break winner',
      'Newest low-like post',
      'Older high-like post',
    ]);

    fireEvent.click(screen.getByRole('button', { name: '高赞共鸣' }));

    renderedTitles = screen.getAllByText(/post|winner/i).map((node) => node.textContent);
    expect(renderedTitles).toEqual([
      'Newest tie-break winner',
      'Older high-like post',
      'Newest low-like post',
    ]);
  });
});
