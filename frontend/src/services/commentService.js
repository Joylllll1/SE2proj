import { storageService } from './storageService';
import { CURRENT_USER_ID } from '../utils';
import { updateCommentCount } from './postService';

const STORAGE_KEY = 'nju_comments';

const SEED_COMMENTS = {
  'P-4921': [
    {
      id: 5928763,
      userId: 'U-SEED05',
      content: '插座问题确实该修了，上次我带了充电宝才敢去，五楼真的太难抢位置了。',
      time: '1小时前',
      likes: 24,
      official: false,
      replies: [
        { id: 5928764, userId: 'U-SEED06', content: '同感，建议早点去四楼，四楼插座好一点，就是没那么安静。', time: '45分钟前', likes: 5 },
      ],
    },
    {
      id: 5928765,
      userId: 'U-OFFICIAL',
      content: '感谢反馈，我们已记录您的建议。后勤部门会在本周末对五楼插座与空调进行集中排查和维护。',
      time: '30分钟前',
      likes: 89,
      official: true,
      replies: [],
    },
  ],
};

export async function getCommentsMap() {
  return storageService.load(STORAGE_KEY, SEED_COMMENTS);
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
