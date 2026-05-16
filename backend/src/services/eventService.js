import Event from '../models/Event.js';
import AuditLog from '../models/AuditLog.js';
import AppError from '../utils/AppError.js';

// ─── Event Creation ───

export async function createEvent(eventData, userId) {
  const { title, type, place, time, description, image } = eventData;

  // Validate required fields
  if (!title || !title.trim()) {
    throw new AppError('请输入活动名称', 400, 'MISSING_TITLE');
  }
  if (!type) {
    throw new AppError('请选择活动类型', 400, 'MISSING_TYPE');
  }
  if (!place || !place.trim()) {
    throw new AppError('请输入活动地点', 400, 'MISSING_PLACE');
  }
  if (!time) {
    throw new AppError('请选择活动时间', 400, 'MISSING_TIME');
  }

  const event = await Event.create({
    title: title.trim(),
    type,
    place: place.trim(),
    time: new Date(time),
    description: description?.trim() || '',
    image: image?.trim() || '',
    status: 'pending',
    submittedBy: userId,
  });

  return event;
}

// ─── Event Queries ───

export async function getPendingEvents() {
  return Event.find({ status: 'pending' })
    .populate('submittedBy', 'email nickname')
    .sort({ createdAt: -1 })
    .lean();
}

export async function getApprovedEvents() {
  return Event.find({ status: 'approved' })
    .populate('submittedBy', 'email nickname')
    .populate('reviewedBy', 'email nickname')
    .sort({ reviewedAt: -1 })
    .lean();
}

export async function getRejectedEvents() {
  return Event.find({ status: 'rejected' })
    .populate('submittedBy', 'email nickname')
    .populate('reviewedBy', 'email nickname')
    .sort({ reviewedAt: -1 })
    .lean();
}

export async function getArchivedEvents() {
  return Event.find({ status: 'archived' })
    .populate('submittedBy', 'email nickname')
    .populate('reviewedBy', 'email nickname')
    .sort({ reviewedAt: -1 })
    .lean();
}

export async function getPublicEvents() {
  // Public events: only approved, not archived
  return Event.find({ status: 'approved' })
    .select('title type place time description image reviewedAt')
    .sort({ reviewedAt: -1 })
    .lean();
}

// ─── Event Actions ───

export async function approveEvent(eventId, adminId) {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new AppError('活动不存在', 404, 'EVENT_NOT_FOUND');
  }

  if (event.status !== 'pending') {
    throw new AppError('只能审核待处理的活动', 400, 'INVALID_STATUS');
  }

  event.status = 'approved';
  event.reviewedBy = adminId;
  event.reviewedAt = new Date();
  await event.save();

  // Create audit log
  await AuditLog.create({
    action: 'approve_event',
    adminId,
    targetUserId: event.submittedBy,
    reason: '活动审核通过',
  });

  return event;
}

export async function rejectEvent(eventId, adminId, reason) {
  if (!reason || !reason.trim()) {
    throw new AppError('请填写拒绝原因', 400, 'MISSING_REASON');
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new AppError('活动不存在', 404, 'EVENT_NOT_FOUND');
  }

  if (event.status !== 'pending') {
    throw new AppError('只能审核待处理的活动', 400, 'INVALID_STATUS');
  }

  event.status = 'rejected';
  event.reviewedBy = adminId;
  event.reviewedAt = new Date();
  event.rejectionReason = reason.trim();
  await event.save();

  // Create audit log
  await AuditLog.create({
    action: 'reject_event',
    adminId,
    targetUserId: event.submittedBy,
    reason: reason.trim(),
  });

  return event;
}

export async function archiveEvent(eventId, adminId) {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new AppError('活动不存在', 404, 'EVENT_NOT_FOUND');
  }

  if (event.status !== 'approved') {
    throw new AppError('只能归档已通过的活动', 400, 'INVALID_STATUS');
  }

  event.status = 'archived';
  await event.save();

  // Create audit log
  await AuditLog.create({
    action: 'archive_event',
    adminId,
    targetUserId: event.submittedBy,
    reason: '活动归档',
  });

  return event;
}
