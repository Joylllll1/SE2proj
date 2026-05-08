import { storageService } from './storageService';

const PENDING_KEY = 'nju_pending_events';
const APPROVED_KEY = 'nju_approved_events';
const REJECTED_KEY = 'nju_rejected_events';
const ARCHIVED_KEY = 'nju_archived_events';
const CAROUSEL_KEY = 'nju_carousel_items';

export async function getPendingEvents() {
  return storageService.load(PENDING_KEY, []);
}

export async function getApprovedEvents() {
  return storageService.load(APPROVED_KEY, []);
}

export async function getRejectedEvents() {
  return storageService.load(REJECTED_KEY, []);
}

export async function getArchivedEvents() {
  return storageService.load(ARCHIVED_KEY, []);
}

export async function getCarouselItems() {
  return storageService.load(CAROUSEL_KEY, []);
}

export async function submitEvent(event) {
  const pending = await getPendingEvents();
  const updated = [event, ...pending];
  await storageService.save(PENDING_KEY, updated);
}

export async function approveEvent(event) {
  const pending = await getPendingEvents();
  const approved = await getApprovedEvents();
  const approvedEvent = {
    id: event.id,
    title: event.title,
    type: event.type,
    place: event.place,
    time: event.time,
    image: event.poster,
    description: event.description,
    status: 'approved',
    reviewedAt: new Date().toISOString(),
  };
  await storageService.save(APPROVED_KEY, [approvedEvent, ...approved]);
  await storageService.save(PENDING_KEY, pending.filter((e) => e.id !== event.id));
  return approvedEvent;
}

export async function rejectEvent(eventId, reason) {
  const pending = await getPendingEvents();
  const rejected = await getRejectedEvents();
  const event = pending.find((e) => e.id === eventId);
  if (!event) return null;
  const rejectedEvent = {
    ...event,
    status: 'rejected',
    rejectionReason: reason,
    reviewedAt: new Date().toISOString(),
  };
  await storageService.save(REJECTED_KEY, [rejectedEvent, ...rejected]);
  await storageService.save(PENDING_KEY, pending.filter((e) => e.id !== eventId));
  return rejectedEvent;
}

export async function archiveEvent(event) {
  const approved = await getApprovedEvents();
  const archived = await getArchivedEvents();
  await storageService.save(ARCHIVED_KEY, [event, ...archived]);
  await storageService.save(APPROVED_KEY, approved.filter((e) => e.id !== event.id));
}

export async function persistCarouselItems(items) {
  return storageService.save(CAROUSEL_KEY, items);
}
