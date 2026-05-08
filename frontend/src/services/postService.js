import { storageService } from './storageService';
import { genId, CURRENT_USER_ID } from '../utils';

const STORAGE_KEY = 'nju_posts';

const SEED_POSTS = [
  {
    id: 'P-4921',
    ownerUserId: 'U-SEED01',
    time: '12分钟前',
    campus: '仙林校区',
    title: '杜厦图书馆五楼的夕阳',
    content:
      '今天刚好赶在闭馆前完成了一篇难啃的论文，走出大楼那一刻吹着晚风，感觉所有的焦虑都消失了。生活不仅有 DDL，还有此刻的晚霞。',
    mood: '宁静',
    moodType: 'calm',
    likes: 124,
    comments: 32,
    saves: 18,
    tags: ['杜厦图书馆', '考研倒计时'],
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'P-8820',
    ownerUserId: 'U-SEED02',
    time: '45分钟前',
    campus: '鼓楼校区',
    title: '保研面试前的自我怀疑',
    content:
      '这周就要保研面试了，每天都在疯狂刷题。可是看着周围厉害的大佬，总觉得自己还不够好。有没有学长学姐分享一下当年跨过这个阶段的心情？',
    mood: '焦虑',
    moodType: 'anxious',
    likes: 88,
    comments: 56,
    saves: 41,
    tags: ['保研', '求建议'],
  },
  {
    id: 'P-2105',
    ownerUserId: 'U-SEED03',
    time: '2小时前',
    campus: '仙林校区',
    title: '六食堂门口的三花猫',
    content:
      '在六食堂偶遇了一只超级粘人的三花猫。它在台阶上晒太阳，看到人走近还会慢慢伸懒腰。今天的好运被承包了。',
    mood: '快乐',
    moodType: 'happy',
    likes: 2400,
    comments: 412,
    saves: 206,
    tags: ['校园猫', '校园生活'],
    image:
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'P-1020',
    ownerUserId: 'U-SEED04',
    time: '5小时前',
    campus: '仙林校区',
    title: '实验又失败了',
    content:
      '感觉自己像是在无尽的黑夜里行走。明明很努力，但结果总是不尽如人意。有没有人也在这个点还没睡？',
    mood: '忧伤',
    moodType: 'sad',
    likes: 512,
    comments: 89,
    saves: 77,
    tags: ['科研日常', '情绪树洞'],
  },
];

export async function getPosts() {
  return storageService.load(STORAGE_KEY, SEED_POSTS);
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
