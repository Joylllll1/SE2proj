import mongoose from 'mongoose';

const ratingTopicSchema = new mongoose.Schema(
  {
    themeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RatingTheme', required: true, index: true },
    creatorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    tags: [{ type: String, trim: true }],
    images: [{ type: String }],
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

ratingTopicSchema.index({ title: 'text', description: 'text' });

const RatingTopic = mongoose.model('RatingTopic', ratingTopicSchema);
export default RatingTopic;
