import { beforeEach, describe, expect, it, vi } from 'vitest';
import useRatingStore from './ratingStore';
import * as ratingService from '../services/ratingService';

vi.mock('../services/ratingService', () => ({
  toggleRatingCommentLike: vi.fn(),
  toggleRatingReplyLike: vi.fn(),
  addRatingReply: vi.fn(),
}));

describe('ratingStore comment interactions', () => {
  beforeEach(() => {
    useRatingStore.setState(useRatingStore.getInitialState(), true);
    vi.clearAllMocks();
  });

  it('updates comment likes in comments state', async () => {
    useRatingStore.setState({
      comments: [{ id: 'c1', content: 'hello', likes: 0, isLiked: false, replies: [] }],
    });

    ratingService.toggleRatingCommentLike.mockResolvedValue({ likes: 1, isLiked: true });
    await useRatingStore.getState().toggleCommentLike('c1');

    expect(useRatingStore.getState().comments[0]).toMatchObject({ likes: 1, isLiked: true });
  });

  it('updates reply likes in nested comments state', async () => {
    useRatingStore.setState({
      comments: [{
        id: 'c1',
        content: 'hello',
        likes: 0,
        isLiked: false,
        replies: [{ id: 'r1', parentId: 'c1', content: 'reply', likes: 0, isLiked: false }],
      }],
    });

    ratingService.toggleRatingReplyLike.mockResolvedValue({ likes: 2, isLiked: true });
    await useRatingStore.getState().toggleReplyLike('c1', 'r1');

    expect(useRatingStore.getState().comments[0].replies[0]).toMatchObject({ likes: 2, isLiked: true });
  });

  it('appends reply to the matching comment', async () => {
    useRatingStore.setState({
      comments: [{ id: 'c1', content: 'hello', replies: [] }],
    });

    ratingService.addRatingReply.mockResolvedValue({
      id: 'r1',
      parentId: 'c1',
      content: 'new reply',
      likes: 0,
      isLiked: false,
    });

    await useRatingStore.getState().addReply('c1', 'new reply', null);

    expect(useRatingStore.getState().comments[0].replies).toHaveLength(1);
    expect(useRatingStore.getState().getFlatComments()).toHaveLength(2);
  });
});
