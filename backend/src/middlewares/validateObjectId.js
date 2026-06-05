import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

export function isValidObjectId(value) {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value)
    && new mongoose.Types.ObjectId(value).toString() === value;
}

export default function validateObjectId(...paramNames) {
  return (req, _res, next) => {
    for (const name of paramNames) {
      const value = req.params[name];
      if (value && !isValidObjectId(value)) {
        throw new AppError('资源不存在', 404, 'NOT_FOUND');
      }
    }
    next();
  };
}
