import { describe, expect, it } from 'vitest';
import { flattenRatingComments } from './ratingComments';

describe('flattenRatingComments', () => {
  it('flattens comments and replies into one list', () => {
    const flat = flattenRatingComments([
      {
        id: 'c1',
        content: 'comment',
        replies: [
          { id: 'r1', content: 'reply', parentId: 'c1' },
        ],
      },
    ]);

    expect(flat).toHaveLength(2);
    expect(flat[0]).toMatchObject({ id: 'c1', itemType: 'comment' });
    expect(flat[1]).toMatchObject({ id: 'r1', itemType: 'reply' });
  });
});
