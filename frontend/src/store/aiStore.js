import { create } from 'zustand';
import * as aiService from '../services/aiService';

const DEFAULT_AI_PERSONA = {
  role: '',
  persona: '',
  tone: '',
  directness: 'balanced',
  verbosity: 'medium',
  customInstruction: '',
};

const EMPTY_AI_PERSONA = {
  role: '',
  persona: '',
  tone: '',
  directness: '',
  verbosity: '',
  customInstruction: '',
};

const AI_PERSONA_FIELDS = Object.keys(EMPTY_AI_PERSONA);

function withPersonaDefaults(persona = {}) {
  return {
    ...DEFAULT_AI_PERSONA,
    ...persona,
  };
}

function toPersonaDraft(persona = {}) {
  return {
    ...EMPTY_AI_PERSONA,
    ...persona,
  };
}

function normalizeDraftValue(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  return value;
}

function compactPersonaDraft(persona = {}) {
  return Object.entries(persona).reduce((result, [key, value]) => {
    const normalized = normalizeDraftValue(value);

    if (typeof normalized === 'string') {
      if (normalized) {
        result[key] = normalized;
      }
      return result;
    }

    if (normalized !== undefined && normalized !== null && normalized !== '') {
      result[key] = normalized;
    }

    return result;
  }, {});
}

function createDirtyPersonaPatch(persona = {}, dirtyFields = {}) {
  return Object.keys(dirtyFields).reduce((result, field) => {
    if (!dirtyFields[field]) {
      return result;
    }

    result[field] = normalizeDraftValue(persona[field]);
    return result;
  }, {});
}

function compactDefaultPersonaDraft(persona = {}) {
  const compacted = compactPersonaDraft(persona);

  return Object.entries(compacted).reduce((result, [key, value]) => {
    if (DEFAULT_AI_PERSONA[key] !== value) {
      result[key] = value;
    }
    return result;
  }, {});
}

const useAIStore = create((set, get) => ({
  // State
  sessions: [],
  currentSession: null,
  messages: [],
  showSessionList: false,
  isLoading: false,
  isPersonaViewOpen: false,
  isPersonaLoading: false,
  isPersonaSaving: false,
  personaDirty: false,
  personaDirtyFields: {},
  isStopping: false,
  defaultPersona: {},
  defaultEffectivePersona: { ...DEFAULT_AI_PERSONA },
  sessionPersona: {},
  effectivePersona: { ...DEFAULT_AI_PERSONA },
  personaDraft: { ...EMPTY_AI_PERSONA },
  activeRequestController: null,
  toolStatus: null,
  streamingContent: '',
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
        sessionPersona: session.aiPersona || {},
        effectivePersona: withPersonaDefaults(session.effectivePersona),
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
        sessionPersona: session.aiPersona || {},
        effectivePersona: withPersonaDefaults(session.effectivePersona),
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
    const controller = new AbortController();

    const tempUserMessage = {
      _id: 'temp-' + Date.now(), role: 'user', content,
      createdAt: new Date().toISOString(),
    };

    set({
      messages: [...messages, tempUserMessage],
      isLoading: true, isStopping: false, streamingContent: '',
      toolStatus: null, activeRequestController: controller,
    });

    try {
      await aiService.sendMessageStream(currentSession?._id, content, {
        signal: controller.signal,
        onToolCall: (tool, args) => {
          set({ toolStatus: `正在调用 ${tool}...` });
        },
        onToolResult: () => {
          set({ toolStatus: null });
        },
        onToken: (token) => {
          set((state) => ({ streamingContent: state.streamingContent + token }));
        },
        onDone: async () => {
          await get().syncCurrentSessionAfterStream();
          set({ streamingContent: '', toolStatus: null, isLoading: false, activeRequestController: null });
        },
        onError: (message) => {
          set((state) => ({
            messages: state.messages.filter(m => m._id !== tempUserMessage._id),
            error: message, isLoading: false, streamingContent: '',
            toolStatus: null, activeRequestController: null,
          }));
        },
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        await get().syncCurrentSessionAfterAbort();
        return;
      }
      set((state) => ({
        messages: state.messages.filter(m => m._id !== tempUserMessage._id),
        isLoading: false, streamingContent: '', toolStatus: null,
        activeRequestController: null, error: err.message,
      }));
    }
  },

  regenerateMessage: async () => {
    const { currentSession, messages } = get();
    if (!currentSession) return;
    const controller = new AbortController();

    set({
      isLoading: true, isStopping: false, streamingContent: '',
      toolStatus: null, activeRequestController: controller,
    });

    try {
      // Remove last assistant content — will be streamed anew
      const msgsWithoutLastAssistant = [...messages];
      for (let i = msgsWithoutLastAssistant.length - 1; i >= 0; i--) {
        if (msgsWithoutLastAssistant[i].role === 'assistant') {
          msgsWithoutLastAssistant[i] = { ...msgsWithoutLastAssistant[i], content: '' };
          break;
        }
      }
      set({ messages: msgsWithoutLastAssistant });

      await aiService.regenerateMessageStream(currentSession._id, {
        signal: controller.signal,
        onToolCall: (tool) => set({ toolStatus: `正在调用 ${tool}...` }),
        onToolResult: () => set({ toolStatus: null }),
        onToken: (token) => set((state) => ({ streamingContent: state.streamingContent + token })),
        onDone: async () => {
          await get().syncCurrentSessionAfterStream();
          set({ streamingContent: '', toolStatus: null, isLoading: false, activeRequestController: null });
        },
        onError: (message) => {
          set({ error: message, isLoading: false, streamingContent: '', toolStatus: null, activeRequestController: null });
        },
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        await get().syncCurrentSessionAfterAbort();
        return;
      }
      set({ isLoading: false, streamingContent: '', toolStatus: null, activeRequestController: null, error: err.message });
    }
  },

  toggleSessionList: () => {
    set((state) => ({ showSessionList: !state.showSessionList }));
  },

  closeSessionList: () => {
    set({ showSessionList: false });
  },

  cancelActiveRequest: () => {
    const controller = get().activeRequestController;
    if (!controller) return;

    set({ isStopping: true });
    controller.abort();
  },

  syncCurrentSessionAfterAbort: async () => {
    const { currentSession } = get();

    if (!currentSession?._id) {
      set((state) => ({
        messages: state.messages.filter((message) => !String(message._id).startsWith('temp-')),
        isLoading: false,
        isStopping: false,
        activeRequestController: null,
        error: null,
      }));
      return;
    }

    try {
      const [sessionData, sessions] = await Promise.all([
        aiService.getSession(currentSession._id),
        aiService.getSessions(),
      ]);

      set({
        sessions,
        currentSession: sessionData.session,
        messages: sessionData.messages,
        sessionPersona: sessionData.session.aiPersona || {},
        effectivePersona: withPersonaDefaults(sessionData.session.effectivePersona),
        isLoading: false,
        isStopping: false,
        activeRequestController: null,
        error: null,
      });
    } catch {
      set((state) => ({
        messages: state.messages.filter((message) => !String(message._id).startsWith('temp-')),
        isLoading: false,
        isStopping: false,
        activeRequestController: null,
        error: null,
      }));
    }
  },

  syncCurrentSessionAfterStream: async () => {
    const { currentSession } = get();
    if (!currentSession?._id) {
      set({ isLoading: false, streamingContent: '', toolStatus: null, activeRequestController: null });
      return;
    }
    try {
      const [sessionData, sessions] = await Promise.all([
        aiService.getSession(currentSession._id),
        aiService.getSessions(),
      ]);
      set({
        sessions, currentSession: sessionData.session,
        messages: sessionData.messages,
        sessionPersona: sessionData.session.aiPersona || {},
        effectivePersona: withPersonaDefaults(sessionData.session.effectivePersona),
        isLoading: false, streamingContent: '', toolStatus: null,
        activeRequestController: null, error: null,
      });
    } catch {
      set({ isLoading: false, streamingContent: '', toolStatus: null, activeRequestController: null });
    }
  },

  openPersonaSettings: async () => {
    const { currentSession } = get();

    set({
      isPersonaViewOpen: true,
      isPersonaLoading: true,
      isPersonaSaving: false,
      personaDirty: false,
      personaDirtyFields: {},
      showSessionList: false,
      error: null,
    });

    try {
      const defaultData = await aiService.getProfile();
      let sessionData = null;

      if (currentSession?._id) {
        sessionData = await aiService.getSessionPersona(currentSession._id);
      }

      const effectivePersona = withPersonaDefaults(
        sessionData?.effectivePersona || defaultData.effectivePersona
      );

      set((state) => ({
        defaultPersona: defaultData.persona || {},
        defaultEffectivePersona: withPersonaDefaults(defaultData.effectivePersona),
        sessionPersona: sessionData?.persona || {},
        effectivePersona,
        personaDraft: toPersonaDraft(effectivePersona),
        isPersonaLoading: false,
        currentSession: state.currentSession
          ? {
            ...state.currentSession,
            aiPersona: sessionData?.persona || state.currentSession.aiPersona || {},
            effectivePersona,
          }
          : state.currentSession,
      }));
    } catch (err) {
      set({
        isPersonaLoading: false,
        error: err.message,
      });
      throw err;
    }
  },

  closePersonaSettings: () => {
    set({
      isPersonaViewOpen: false,
      isPersonaLoading: false,
      isPersonaSaving: false,
      personaDirty: false,
      personaDirtyFields: {},
    });
  },

  updatePersonaField: (field, value) => {
    set((state) => ({
      personaDraft: {
        ...state.personaDraft,
        [field]: value,
      },
      personaDirty: true,
      personaDirtyFields: {
        ...state.personaDirtyFields,
        [field]: true,
      },
    }));
  },

  resetPersonaDraft: () => {
    set({
      personaDraft: { ...EMPTY_AI_PERSONA },
      personaDirty: true,
      personaDirtyFields: AI_PERSONA_FIELDS.reduce((result, field) => {
        result[field] = true;
        return result;
      }, {}),
    });
  },

  saveDefaultPersona: async () => {
    const { currentSession, defaultEffectivePersona, personaDraft, personaDirtyFields } = get();

    set({ isPersonaSaving: true, error: null });

    try {
      const nextDefaultDraft = { ...defaultEffectivePersona };
      for (const field of Object.keys(personaDirtyFields)) {
        nextDefaultDraft[field] = personaDraft[field];
      }

      const profile = await aiService.updateProfile(compactDefaultPersonaDraft(nextDefaultDraft));
      let nextState = {
        defaultPersona: profile.persona || {},
        defaultEffectivePersona: withPersonaDefaults(profile.effectivePersona),
        isPersonaSaving: false,
        personaDirty: false,
        personaDirtyFields: {},
      };

      if (currentSession?._id) {
        const sessionData = await aiService.getSessionPersona(currentSession._id);
        const effectivePersona = withPersonaDefaults(sessionData.effectivePersona);

        nextState = {
          ...nextState,
          sessionPersona: sessionData.persona || {},
          effectivePersona,
          personaDraft: toPersonaDraft(effectivePersona),
          currentSession: {
            ...currentSession,
            aiPersona: sessionData.persona || {},
            effectivePersona,
          },
          sessions: get().sessions.map((session) => (
            session._id === currentSession._id
              ? {
                ...session,
                hasPersonaOverride: Boolean(sessionData.persona && Object.keys(sessionData.persona).length > 0),
              }
              : session
          )),
        };
      } else {
        nextState = {
          ...nextState,
          effectivePersona: withPersonaDefaults(profile.effectivePersona),
          personaDraft: toPersonaDraft(profile.effectivePersona),
        };
      }

      set(nextState);
      return nextState;
    } catch (err) {
      set({ isPersonaSaving: false, error: err.message });
      throw err;
    }
  },

  saveSessionPersona: async () => {
    const { currentSession, personaDraft, personaDirtyFields } = get();
    if (!currentSession?._id) return null;

    set({ isPersonaSaving: true, error: null });

    try {
      const result = await aiService.updateSessionPersona(
        currentSession._id,
        createDirtyPersonaPatch(personaDraft, personaDirtyFields)
      );
      const effectivePersona = withPersonaDefaults(result.effectivePersona);

      set({
        sessionPersona: result.persona || {},
        effectivePersona,
        personaDraft: toPersonaDraft(effectivePersona),
        currentSession: {
          ...currentSession,
          aiPersona: result.persona || {},
          effectivePersona,
        },
        sessions: get().sessions.map((session) => (
          session._id === currentSession._id
            ? {
              ...session,
              hasPersonaOverride: Boolean(result.persona && Object.keys(result.persona).length > 0),
            }
            : session
        )),
        isPersonaSaving: false,
        personaDirty: false,
        personaDirtyFields: {},
      });

      return result;
    } catch (err) {
      set({ isPersonaSaving: false, error: err.message });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAIStore;
