import mongoose from 'mongoose';

const ratingReplySchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    anonId: { type: String, required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replyToId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const ratingCommentSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'RatingTopic', required: true, index: true },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    anonId: { type: String, required: true },
    stars: { type: Number, min: 1, max: 5, default: null },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false, index: true },
    replies: [ratingReplySchema],
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

const RatingComment = mongoose.model('RatingComment', ratingCommentSchema);
export default RatingComment;
