// src/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, required: true, trim: true, minlength: 2, maxlength: 50 
  },
  email: { 
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true,
    default: undefined,
    validate: {
      validator: (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      message: 'Email không hợp lệ'
    }
  },
  phone: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
    validate: {
      validator: (val) => !val || /^[0-9]{8,15}$/.test(val.replace(/\s+/g, '').replace('+', '')),
      message: 'Số điện thoại không hợp lệ'
    }
  },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'seller', 'customer'], default: 'customer' },
  is_active: { type: Boolean, default: true },
  email_verified: { type: Boolean, default: false },
  phone_verified: { type: Boolean, default: false },
  avatar: { type: String, default: null },
  last_login: { type: Date, default: null },
  login_attempts: { type: Number, default: 0 },
  locked_until: { type: Date, default: null },

  // fields for social providers
  facebookId: { type: String, default: null, unique: true, sparse: true },
  googleId:   { type: String, default: null, unique: true, sparse: true },
  appleId:    { type: String, default: null, unique: true, sparse: true }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      delete ret.login_attempts;
      delete ret.locked_until;
      return ret;
    }
  }
});

userSchema.index(
  { email: 1 }, 
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: "string" } // Chỉ áp dụng unique khi email là string
    }
  }
);

// Ensure at least one of phone or socialId or email is present
userSchema.pre('validate', function(next) {
  if (!this.phone && !this.email && !this.facebookId && !this.googleId && !this.appleId) {
    const err = new Error('Phải có ít nhất phone hoặc social login hoặc email');
    err.name = 'ValidationError';
    return next(err);
  }
  next();
});

// Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch(err) {
    next(err);
  }
});

// methods
userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};
userSchema.methods.isLocked = function() {
  return !!(this.locked_until && this.locked_until > Date.now());
};
userSchema.methods.incLoginAttempts = function() {
  const max = 5;
  const lockTime = 2*60*60*1000;
  if (this.locked_until && this.locked_until < Date.now()) {
    return this.updateOne({ $unset: { locked_until: 1 }, $set: { login_attempts: 1 }});
  }
  const updates = { $inc: { login_attempts: 1 }};
  if (this.login_attempts+1 >= max && !this.isLocked()) {
    updates.$set = { locked_until: Date.now()+lockTime };
  }
  return this.updateOne(updates);
};
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({ $unset: { login_attempts:1, locked_until:1 }});
};

// Static find
userSchema.statics.findByEmailOrPhone = function(idf) {
  const val = idf.trim();
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRx.test(val)) return this.findOne({ email: val.toLowerCase() });
  return this.findOne({ phone: val });
};

// Indexes
userSchema.index({ email:1 });
userSchema.index({ phone:1 });
userSchema.index({ facebookId:1 });
userSchema.index({ googleId:1 });
userSchema.index({ appleId:1 });
userSchema.index({ createdAt:-1 });

module.exports = mongoose.model('User', userSchema);