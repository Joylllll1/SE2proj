import * as authService from '../services/authService.js';

export const register = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.register(email, password);
  res.status(201).json(result);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
};

export const getMe = async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.json({ user });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);
  res.json(result);
};

export const logout = async (_req, res) => {
  const result = await authService.logout();
  res.json(result);
};

export const updateProfile = async (req, res) => {
  const result = await authService.updateProfile(req.user.id, req.body);
  res.json(result);
};

export const changePassword = async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);
  res.json(result);
};
