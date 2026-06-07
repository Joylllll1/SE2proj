import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PostCard from './PostCard';
import Comment from './Comment';
import { EventDetailModal } from './EventModals';
import PlainTextContent from './PlainTextContent';
import ReplyCard from './ReplyCard';

vi.mock('./Icon', () => ({
  default: () => <span data-testid="icon" />,
}));

vi.mock('./ClickableImage', () => ({
  default: () => <span data-testid="image" />,
}));

vi.mock('./TimeAgo', () => ({
  default: () => <span data-testid="time-ago" />,
}));

vi.mock('../features/ReportModal', () => ({
  default: () => null,
}));

vi.mock('./ConfirmLeaveDialog', () => ({
  default: () => null,
}));

vi.mock('../../store/commentStore', () => ({
  default: (selector) => selector({
    toggleLike: vi.fn(),
    toggleReplyLike: vi.fn(),
  }),
}));

describe('content whitespace rendering', () => {
  it('preserves line breaks in PlainTextContent by default', () => {
    const { container } = render(
      <PlainTextContent content={'first line\nsecond line'} />,
    );

    const content = container.querySelector('p.whitespace-pre-wrap');
    expect(content).not.toBeNull();
    expect(content.textContent).toContain('\n');
  });

  it('preserves post line breaks in PostCard', () => {
    const { container } = render(
      <PostCard
        post={{
          id: 'post-1',
          ownerUserId: 'user-1',
          title: 'Post title',
          content: 'first line\nsecond line',
          tags: [],
          createdAt: new Date().toISOString(),
        }}
        onOpen={vi.fn()}
        liked={false}
        bookmarked={false}
        onLike={vi.fn()}
        onBookmark={vi.fn()}
      />,
    );

    const postContent = container.querySelector('p.whitespace-pre-wrap');
    expect(postContent).not.toBeNull();
    expect(postContent.textContent).toContain('\n');
  });

  it('preserves comment line breaks in Comment', () => {
    const { container } = render(
      <Comment
        comment={{
          id: 'comment-1',
          ownerUserId: 'user-1',
          content: 'comment line 1\ncomment line 2',
          createdAt: new Date().toISOString(),
          likes: 0,
          isLiked: false,
        }}
        postId="post-1"
        currentUserId="user-1"
        onReply={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const commentContent = container.querySelector('p.whitespace-pre-wrap');
    expect(commentContent).not.toBeNull();
    expect(commentContent.textContent).toContain('\n');
  });

  it('preserves reply and quoted content line breaks in ReplyCard', () => {
    const { container } = render(
      <ReplyCard
        reply={{
          id: 'reply-1',
          parentId: 'comment-1',
          ownerUserId: 'user-2',
          parentAuthorId: 'user-1',
          parentContent: 'quoted line 1\nquoted line 2',
          content: 'reply line 1\nreply line 2',
          createdAt: new Date().toISOString(),
          parentTime: new Date().toISOString(),
          likes: 0,
          isLiked: false,
        }}
        postId="post-1"
        currentUserId="user-2"
        onReply={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const whitespaceNodes = container.querySelectorAll('.whitespace-pre-wrap');
    expect(whitespaceNodes).toHaveLength(2);
    expect(whitespaceNodes[0].textContent).toContain('\n');
    expect(whitespaceNodes[1].textContent).toContain('\n');
  });

  it('preserves event description line breaks in EventDetailModal', () => {
    const { container } = render(
      <EventDetailModal
        event={{
          title: 'Event title',
          type: '讲座',
          time: new Date().toISOString(),
          place: '仙林',
          description: 'line 1\nline 2',
        }}
        onClose={vi.fn()}
      />,
    );

    const eventDescription = container.querySelector('p.whitespace-pre-wrap');
    expect(eventDescription).not.toBeNull();
    expect(eventDescription.textContent).toContain('\n');
  });
});
