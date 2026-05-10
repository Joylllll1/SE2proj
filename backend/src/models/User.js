import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, '请输入邮箱地址'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@(smail\.nju\.edu\.cn|nju\.edu\.cn)$/, '仅支持 nju.edu.cn 和 smail.nju.edu.cn 邮箱'],
    },
    password: {
      type: String,
      required: [true, '请输入密码'],
      minlength: [8, '密码至少 8 位'],
      select: false,
    },
    nickname: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// Auto-generate nickname from email prefix
userSchema.pre('save', function (next) {
  if (this.isModified('email') && !this.nickname) {
    this.nickname = this.email.split('@')[0];
  }
  next();
});

// Compare password instance method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
