import { describe, expect, it } from 'vitest';
import { clampPagination, sortTopicsByScore } from './ratingService.js';

describe('clampPagination', () => {
  it('normalizes page and limit', () => {
    expect(clampPagination(0, 20)).toEqual({ page: 1, limit: 20 });
    expect(clampPagination(2, 100)).toEqual({ page: 2, limit: 50 });
    expect(clampPagination('3', '10')).toEqual({ page: 3, limit: 10 });
  });
});

describe('sortTopicsByScore', () => {
  it('sorts by average score descending', () => {
    const sorted = sortTopicsByScore([
      { title: 'B', averageScore: 3 },
      { title: 'A', averageScore: 5 },
      { title: 'C', averageScore: 4 },
    ]);

    expect(sorted.map((item) => item.title)).toEqual(['A', 'C', 'B']);
  });

  it('uses zh-CN localeCompare for tie scores', () => {
    const sorted = sortTopicsByScore([
      { title: '乙', averageScore: 4 },
      { title: '甲', averageScore: 4 },
    ]);

    expect(sorted.map((item) => item.title)).toEqual(['甲', '乙']);
  });
});
