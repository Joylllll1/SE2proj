import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import RatingDetailPage from './RatingDetailPage';
import useRatingStore from '../../store/ratingStore';
import useUiStore from '../../store/uiStore';

vi.mock('../common/Icon', () => ({
  default: () => <span data-testid="icon" />,
}));

vi.mock('../common/EmptyState', () => ({
  default: ({ title }) => <div>{title}</div>,
}));

vi.mock('../common/Modal', () => ({
  default: ({ children, isOpen }) => (isOpen ? <div>{children}</div> : null),
}));

vi.mock('../features/StarRatingInput', () => ({
  default: () => <div data-testid="star-input" />,
  StarRatingDisplay: () => <div data-testid="star-display" />,
}));

vi.mock('../features/RatingDistribution', () => ({
  default: () => <div data-testid="rating-distribution" />,
}));

vi.mock('../features/RatingCommentCard', () => ({
  default: ({ comment }) => (
    <div data-testid={`comment-${comment.id}`}>
      {comment.content}
      <span data-testid={`comment-likes-${comment.id}`}>{comment.likes}</span>
    </div>
  ),
}));

vi.mock('../features/RatingReplyCard', () => ({
  default: ({ reply }) => <div data-testid={`reply-${reply.id}`}>{reply.content}</div>,
}));

vi.mock('../features/RatingTopicLikeButton', () => ({
  default: () => <button type="button">like topic</button>,
}));

vi.mock('../features/ReportModal', () => ({
  default: () => null,
}));

function seedDetailState(overrides = {}) {
  useRatingStore.setState({
    detailLoading: false,
    fetchDetail: vi.fn().mockResolvedValue(undefined),
    clearDetail: vi.fn(),
    detail: {
      id: 'topic-1',
      title: '测试评分帖',
      themeId: 'theme-1',
      creatorUserId: 'user-1',
      time: '刚刚',
      likes: 0,
      isLiked: false,
      images: [],
    },
    stats: { averageScore: 4.5, totalCount: 2, distribution: [] },
    userRating: null,
    relatedTags: [],
    commentsTotal: 1,
    comments: [{
      id: 'comment-1',
      content: '第一条评论',
      likes: 0,
      isLiked: false,
      replies: [],
      createdAt: '2026-06-01T00:00:00.000Z',
    }],
    ...overrides,
  });
}

describe('RatingDetailPage comments subscription', () => {
  beforeEach(() => {
    useRatingStore.setState(useRatingStore.getInitialState(), true);
    useUiStore.setState({
      navigate: vi.fn(),
      showToast: vi.fn(),
    });
    seedDetailState();
  });

  it('re-renders comment likes when comments state changes', async () => {
    render(<RatingDetailPage topicId="topic-1" themeId="theme-1" />);

    expect(screen.getByText('第一条评论')).toBeInTheDocument();
    expect(screen.getByTestId('comment-likes-comment-1')).toHaveTextContent('0');

    await act(async () => {
      useRatingStore.setState({
        comments: [{
          id: 'comment-1',
          content: '第一条评论',
          likes: 3,
          isLiked: true,
          replies: [],
          createdAt: '2026-06-01T00:00:00.000Z',
        }],
      });
    });

    expect(screen.getByTestId('comment-likes-comment-1')).toHaveTextContent('3');
  });

  it('renders flattened replies when comments include nested replies', async () => {
    seedDetailState({
      comments: [{
        id: 'comment-1',
        content: '第一条评论',
        likes: 0,
        isLiked: false,
        createdAt: '2026-06-01T00:00:00.000Z',
        replies: [{
          id: 'reply-1',
          parentId: 'comment-1',
          content: '第一条回复',
          likes: 0,
          isLiked: false,
          createdAt: '2026-06-02T00:00:00.000Z',
        }],
      }],
    });

    render(<RatingDetailPage topicId="topic-1" themeId="theme-1" />);

    const replyNodes = screen.getAllByTestId('reply-reply-1');
    expect(replyNodes.length).toBeGreaterThan(0);
    expect(replyNodes[0]).toHaveTextContent('第一条回复');
  });
});
