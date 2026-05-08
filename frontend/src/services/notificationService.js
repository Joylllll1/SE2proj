import { storageService } from './storageService';

const STORAGE_KEY = 'nju_notifs';

const SEED_NOTIFS = [
  { id: 'N-1', text: '你的帖子「杜厦图书馆五楼的夕阳」获得了 10 个新赞', time: '2分钟前', read: false },
  { id: 'N-2', text: '温柔的小蓝鲸 回复了你的评论', time: '15分钟前', read: false },
  { id: 'N-3', text: '校园音乐节 2026 报名即将截止，快来参加', time: '1小时前', read: true },
];

export async function getNotifications() {
  return storageService.load(STORAGE_KEY, SEED_NOTIFS);
}

export async function persistNotifications(notifs) {
  return storageService.save(STORAGE_KEY, notifs);
}

export async function addNotification(text) {
  const notifs = await getNotifications();
  const newNotif = {
    id: 'N-' + Date.now(),
    text,
    time: '刚刚',
    read: false,
  };
  const updated = [newNotif, ...notifs];
  await persistNotifications(updated);
  return newNotif;
}

export async function markAllRead() {
  const notifs = await getNotifications();
  const updated = notifs.map((n) => ({ ...n, read: true }));
  await persistNotifications(updated);
}
