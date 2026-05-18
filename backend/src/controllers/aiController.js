import * as aiService from '../services/aiService.js';

export const sendMessage = async (req, res) => {
  const { sessionId, message } = req.body;
  const result = await aiService.sendMessage(req.user.id, sessionId, message);
  res.json({ success: true, data: result });
};

export const regenerateMessage = async (req, res) => {
  const { id } = req.params;
  const result = await aiService.regenerateMessage(req.user.id, id);
  res.json({ success: true, data: result });
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
