import { storageService } from './storageService';
import { genId, CURRENT_USER_ID } from '../utils';

const STORAGE_KEY = 'nju_posts';

export async function getPosts() {
  return storageService.load(STORAGE_KEY, []);
}

export async function persistPosts(posts) {
  return storageService.save(STORAGE_KEY, posts);
}

export async function createPost(postData) {
  const posts = await getPosts();
  const newPost = {
    ...postData,
    id: genId(),
    ownerUserId: CURRENT_USER_ID,
    time: '刚刚',
    likes: 0,
    comments: 0,
    saves: 0,
  };
  const updated = [newPost, ...posts];
  await persistPosts(updated);
  return newPost;
}

export async function updateLikes(postId, increment) {
  const posts = await getPosts();
  const updated = posts.map((p) =>
    p.id === postId ? { ...p, likes: Math.max(0, p.likes + increment) } : p,
  );
  await persistPosts(updated);
}

export async function updateSaves(postId, increment) {
  const posts = await getPosts();
  const updated = posts.map((p) =>
    p.id === postId ? { ...p, saves: Math.max(0, p.saves + increment) } : p,
  );
  await persistPosts(updated);
}

export async function updateCommentCount(postId, increment) {
  const posts = await getPosts();
  const updated = posts.map((p) =>
    p.id === postId ? { ...p, comments: Math.max(0, p.comments + increment) } : p,
  );
  await persistPosts(updated);
}
