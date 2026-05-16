import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    reportCount: { type: Number, default: 1 },
    reasons: [
      {
        reason: { type: String, required: true },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: { type: String, enum: ['pending', 'processed'], default: 'pending', index: true },
  },
  { timestamps: true }
);

// Compound index for efficient query
reportSchema.index({ status: 1, reportCount: -1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
