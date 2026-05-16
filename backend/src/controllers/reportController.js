import * as adminService from '../services/adminService.js';
import AppError from '../utils/AppError.js';

export async function create(req, res) {
  const { id: postId } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  if (!reason || !reason.trim()) {
    throw new AppError('请选择或输入举报原因', 400, 'MISSING_REASON');
  }

  const report = await adminService.createReport(postId, reason, userId);
  res.status(201).json({ message: '举报已提交', report });
}
