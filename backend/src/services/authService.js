import User from '../models/User.js';
import VerificationCode from '../models/VerificationCode.js';
import AppError from '../utils/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const ALLOWED_DOMAINS = ['@nju.edu.cn', '@smail.nju.edu.cn'];

export const register = async (email, password) => {
  // Validate email domain
  const domain = '@' + email.split('@')[1]?.toLowerCase();
  if (!ALLOWED_DOMAINS.includes(domain)) {
    throw new AppError('仅支持 nju.edu.cn 和 smail.nju.edu.cn 邮箱', 400, 'INVALID_DOMAIN');
  }

  // Validate password strength
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new AppError('密码至少 8 位，需包含字母和数字', 400, 'WEAK_PASSWORD');
  }

  // Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('该邮箱已被注册', 409, 'EMAIL_EXISTS');
  }

  // Verify email code
  const verifiedCode = await VerificationCode.findOne({ email, type: 'register', verified: true });
  if (!verifiedCode) {
    throw new AppError('请先完成邮箱验证', 400, 'CODE_NOT_VERIFIED');
  }

  // Create user
  const user = await User.create({ email, password });

  // Clean up used verification code
  await VerificationCode.deleteMany({ email, type: 'register' });

  // Generate tokens
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

export const login = async (email, password) => {
  // Find user with password field included
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('邮箱或密码错误', 401, 'INVALID_CREDENTIALS');
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('邮箱或密码错误', 401, 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new AppError('登录已过期，请重新登录', 401, 'TOKEN_EXPIRED');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('用户不存在', 401, 'USER_NOT_FOUND');
  }

  const accessToken = signAccessToken(user.id);
  const newRefreshToken = signRefreshToken(user.id);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('用户不存在', 401, 'USER_NOT_FOUND');
  }
  return user.toJSON();
};

export const logout = async () => {
  // Stateless JWT — client clears tokens.
  // Future: implement refresh token blacklist or Redis blocklist.
  return { message: '已退出登录' };
};
