import { create } from 'zustand';
import * as aiService from '../services/aiService';

const useAIStore = create((set, get) => ({
  // State
  sessions: [],
  currentSession: null,
  messages: [],
  showSessionList: false,
  isLoading: false,
  error: null,

  // Actions
  fetchSessions: async () => {
    try {
      const sessions = await aiService.getSessions();
      set({ sessions });
      return sessions;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  createSession: async () => {
    try {
      const session = await aiService.createSession();
      const { sessions } = get();
      set({
        sessions: [session, ...sessions],
        currentSession: session,
        messages: [],
        showSessionList: false,
      });
      return session;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  switchSession: async (sessionId) => {
    try {
      const { session, messages } = await aiService.getSession(sessionId);
      set({
        currentSession: session,
        messages,
        showSessionList: false,
      });
    } catch (err) {
      set({ error: err.message });
    }
  },

  deleteSession: async (sessionId) => {
    try {
      await aiService.deleteSession(sessionId);
      const { sessions, currentSession } = get();
      const newSessions = sessions.filter(s => s._id !== sessionId);
      set({ sessions: newSessions });

      // If deleted current session, switch to another or create new
      if (currentSession?._id === sessionId) {
        if (newSessions.length > 0) {
          await get().switchSession(newSessions[0]._id);
        } else {
          await get().createSession();
        }
      }
    } catch (err) {
      set({ error: err.message });
    }
  },

  sendMessage: async (content) => {
    const { currentSession, messages } = get();

    // Add optimistic user message
    const tempUserMessage = {
      _id: 'temp-' + Date.now(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    set({ messages: [...messages, tempUserMessage], isLoading: true });

    try {
      const result = await aiService.sendMessage(currentSession?._id, content);
      const { data } = result;

      set((state) => ({
        messages: [
          ...state.messages.filter(m => m._id !== tempUserMessage._id),
          data.userMessage,
          data.assistantMessage,
        ],
        currentSession: data.session || state.currentSession,
        isLoading: false,
      }));

      // Refresh sessions list to update title
      await get().fetchSessions();
    } catch (err) {
      const savedMessage = err.data?.savedMessage;
      const savedSession = err.data?.session;

      set((state) => ({
        messages: savedMessage
          ? [...state.messages.filter(m => m._id !== tempUserMessage._id), savedMessage]
          : state.messages.filter(m => m._id !== tempUserMessage._id),
        currentSession: savedSession || state.currentSession,
        isLoading: false,
        error: err.message,
      }));
      throw err;
    }
  },

  regenerateMessage: async () => {
    const { currentSession, messages } = get();
    if (!currentSession) return;

    set({ isLoading: true });

    try {
      const newMessage = await aiService.regenerateMessage(currentSession._id);

      // Replace last AI message
      const newMessages = [...messages];
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].role === 'assistant') {
          newMessages[i] = newMessage;
          break;
        }
      }

      set({
        messages: newMessages,
        currentSession: newMessage.session || currentSession,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  toggleSessionList: () => {
    set((state) => ({ showSessionList: !state.showSessionList }));
  },

  closeSessionList: () => {
    set({ showSessionList: false });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAIStore;
