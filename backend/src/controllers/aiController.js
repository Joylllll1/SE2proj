import * as aiService from '../services/aiService.js';
import * as aiPersonaService from '../services/aiPersonaService.js';

function createRequestAbortSignal(req) {
  const controller = new AbortController();
  const abort = () => controller.abort();

  req.on('aborted', abort);
  req.on('close', abort);

  return {
    signal: controller.signal,
    cleanup: () => {
      req.off('aborted', abort);
      req.off('close', abort);
    },
  };
}

export const sendMessage = async (req, res) => {
  const { sessionId, message } = req.body;
  const { signal, cleanup } = createRequestAbortSignal(req);

  try {
    const result = await aiService.sendMessage(req.user.id, sessionId, message, { signal });
    if (!signal.aborted) {
      res.json({ success: true, data: result });
    }
  } finally {
    cleanup();
  }
};

export const regenerateMessage = async (req, res) => {
  const { id } = req.params;
  const { signal, cleanup } = createRequestAbortSignal(req);

  try {
    const result = await aiService.regenerateMessage(req.user.id, id, { signal });
    if (!signal.aborted) {
      res.json({ success: true, data: result });
    }
  } finally {
    cleanup();
  }
};

export const getSessions = async (req, res) => {
  const result = await aiService.getSessions(req.user.id);
  res.json({ success: true, data: { sessions: result } });
};

export const getSession = async (req, res) => {
  const { id } = req.params;
  const result = await aiService.getSession(req.user.id, id);
  res.json({ success: true, data: result });
};

export const createSession = async (req, res) => {
  const result = await aiService.createSession(req.user.id);
  res.status(201).json({ success: true, data: result });
};

export const deleteSession = async (req, res) => {
  const { id } = req.params;
  await aiService.deleteSession(req.user.id, id);
  res.json({ success: true });
};

export const getProfile = async (req, res) => {
  const result = await aiPersonaService.getProfile(req.user.id);
  res.json({ success: true, data: result });
};

export const updateProfile = async (req, res) => {
  const result = await aiPersonaService.updateProfile(req.user.id, req.body?.persona ?? req.body);
  res.json({ success: true, data: result });
};

export const getSessionPersona = async (req, res) => {
  const { id } = req.params;
  const result = await aiPersonaService.getSessionPersona(req.user.id, id);
  res.json({ success: true, data: result });
};

export const updateSessionPersona = async (req, res) => {
  const { id } = req.params;
  const result = await aiPersonaService.updateSessionPersona(req.user.id, id, req.body?.persona ?? req.body);
  res.json({ success: true, data: result });
};
