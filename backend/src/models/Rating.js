import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'RatingTopic', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    anonId: { type: String, required: true, index: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true },
);

ratingSchema.index({ topicId: 1, userId: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);
export default Rating;
