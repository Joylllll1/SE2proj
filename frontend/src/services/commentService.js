import { storageService } from './storageService';
import { CURRENT_USER_ID } from '../utils';
import { updateCommentCount } from './postService';

const STORAGE_KEY = 'nju_comments';

export async function getCommentsMap() {
  return storageService.load(STORAGE_KEY, {});
}

export async function persistCommentsMap(commentsMap) {
  return storageService.save(STORAGE_KEY, commentsMap);
}

export async function addComment(postId, content, official = false) {
  const commentsMap = await getCommentsMap();
  const newComment = {
    id: Date.now(),
    userId: official ? 'U-OFFICIAL' : CURRENT_USER_ID,
    content,
    time: '刚刚',
    likes: 0,
    official,
    replies: [],
  };
  const updated = {
    ...commentsMap,
    [postId]: [...(commentsMap[postId] || []), newComment],
  };
  await persistCommentsMap(updated);
  await updateCommentCount(postId, 1);
  return newComment;
}

export async function getComments(postId) {
  const commentsMap = await getCommentsMap();
  return commentsMap[postId] || [];
}
