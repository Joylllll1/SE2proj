import mongoose from 'mongoose';

const aiSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: '新会话',
      maxlength: 20,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by user and updatedAt
aiSessionSchema.index({ user: 1, updatedAt: -1 });

export default mongoose.model('AISession', aiSessionSchema);
