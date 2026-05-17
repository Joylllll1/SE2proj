import Notification from '../models/Notification.js';

const NOTIFICATION_LIMIT = 30;

// ─── Notification Creation ───

export async function createNotification(data) {
  const { recipient, type, title, content, relatedId, relatedType, relatedData } = data;

  const notification = await Notification.create({
    recipient,
    type,
    title,
    content: content || '',
    relatedId: relatedId || null,
    relatedType: relatedType || null,
    relatedData: relatedData || null,
    read: false,
  });

  // Async cleanup: keep only latest 30 notifications
  cleanupOldNotifications(recipient).catch(() => {});

  return notification;
}

// ─── Notification Queries ───

export async function getNotifications(userId) {
  return Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(NOTIFICATION_LIMIT)
    .lean();
}

export async function getUnreadCount(userId) {
  return Notification.countDocuments({ recipient: userId, read: false });
}

// ─── Mark as Read ───

export async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );
  return notification;
}

export async function markAllAsRead(userId) {
  const result = await Notification.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
  return result.modifiedCount;
}

// ─── Cleanup ───

async function cleanupOldNotifications(userId) {
  const count = await Notification.countDocuments({ recipient: userId });
  if (count > NOTIFICATION_LIMIT) {
    const toDelete = count - NOTIFICATION_LIMIT;
    const oldNotifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: 1 })
      .limit(toDelete)
      .select('_id');

    const ids = oldNotifications.map((n) => n._id);
    await Notification.deleteMany({ _id: { $in: ids } });
  }
}

// ─── Trigger Helpers ───

export async function notifyComment(postAuthorId, commenterName, postTitle, postId) {
  return createNotification({
    recipient: postAuthorId,
    type: 'comment',
    title: '收到新评论',
    content: `${commenterName} 评论了你的帖子《${postTitle}》`,
    relatedId: postId,
    relatedType: 'post',
    relatedData: { postTitle },
  });
}

export async function notifyLike(postAuthorId, postTitle, postId) {
  return createNotification({
    recipient: postAuthorId,
    type: 'like',
    title: '收到新点赞',
    content: `有人赞了你的帖子《${postTitle}》`,
    relatedId: postId,
    relatedType: 'post',
    relatedData: { postTitle },
  });
}

export async function notifyEventApproved(userId, eventTitle, eventId) {
  return createNotification({
    recipient: userId,
    type: 'event_approved',
    title: '活动审核通过',
    content: `你的活动《${eventTitle}》已通过审核`,
    relatedId: eventId,
    relatedType: 'event',
    relatedData: { eventTitle },
  });
}

export async function notifyEventRejected(userId, eventTitle, reason, eventId) {
  return createNotification({
    recipient: userId,
    type: 'event_rejected',
    title: '活动审核未通过',
    content: `你的活动《${eventTitle}》未通过审核${reason ? `：${reason}` : ''}`,
    relatedId: eventId,
    relatedType: 'event',
    relatedData: { eventTitle, reason },
  });
}

export async function notifyBanned(userId, reason) {
  return createNotification({
    recipient: userId,
    type: 'banned',
    title: '账号被封禁',
    content: reason || '你的账号已被封禁，请联系管理员了解详情',
  });
}

export async function notifyUnbanned(userId) {
  return createNotification({
    recipient: userId,
    type: 'unbanned',
    title: '账号已解封',
    content: '你的账号已解封，欢迎回来',
  });
}
