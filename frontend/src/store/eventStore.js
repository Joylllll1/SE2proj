import { create } from 'zustand';
import { loadJSON, saveJSON } from '../utils';

const useEventStore = create((set, get) => ({
  pendingEvents: loadJSON('nju_pending_events', []),
  approvedEvents: loadJSON('nju_approved_events', []),
  rejectedEvents: loadJSON('nju_rejected_events', []),
  archivedEvents: loadJSON('nju_archived_events', []),
  carouselItems: loadJSON('nju_carousel_items', []),

  submitEvent: (event) => {
    const updated = [event, ...get().pendingEvents];
    set({ pendingEvents: updated });
    saveJSON('nju_pending_events', updated);
  },

  approveEvent: (event) => {
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
    const newPending = get().pendingEvents.filter((e) => e.id !== event.id);
    const newApproved = [approvedEvent, ...get().approvedEvents];
    set({ pendingEvents: newPending, approvedEvents: newApproved });
    saveJSON('nju_pending_events', newPending);
    saveJSON('nju_approved_events', newApproved);
    return approvedEvent;
  },

  rejectEvent: (eventId, reason) => {
    const event = get().pendingEvents.find((e) => e.id === eventId);
    if (!event) return null;
    const rejectedEvent = {
      ...event,
      status: 'rejected',
      rejectionReason: reason,
      reviewedAt: new Date().toISOString(),
    };
    const newPending = get().pendingEvents.filter((e) => e.id !== eventId);
    const newRejected = [rejectedEvent, ...get().rejectedEvents];
    set({ pendingEvents: newPending, rejectedEvents: newRejected });
    saveJSON('nju_pending_events', newPending);
    saveJSON('nju_rejected_events', newRejected);
    return rejectedEvent;
  },

  archiveEvent: (event) => {
    const newApproved = get().approvedEvents.filter((e) => e.id !== event.id);
    const newArchived = [event, ...get().archivedEvents];
    set({ approvedEvents: newApproved, archivedEvents: newArchived });
    saveJSON('nju_approved_events', newApproved);
    saveJSON('nju_archived_events', newArchived);
  },

  updateCarousel: (items) => {
    set({ carouselItems: items });
    saveJSON('nju_carousel_items', items);
  },
}));

export default useEventStore;
