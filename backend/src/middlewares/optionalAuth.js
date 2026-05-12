import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

const optionalAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch {
    // Token invalid or expired — continue without user
  }

  next();
};

export default optionalAuth;
