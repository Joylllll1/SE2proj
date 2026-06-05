import mongoose from 'mongoose';

const ratingThemeSchema = new mongoose.Schema(
  {
    creatorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

ratingThemeSchema.index({ name: 'text', description: 'text' });

const RatingTheme = mongoose.model('RatingTheme', ratingThemeSchema);
export default RatingTheme;
