const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Tên là bắt buộc'],
    trim: true,
    minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
    maxlength: [50, 'Tên không được quá 50 ký tự']
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        if (!email) return true; // Allow empty email if phone is provided
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Email không hợp lệ'
    }
  },
  phone: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true,
    validate: {
      validator: function(phone) {
        if (!phone) return true; // Allow empty phone if email is provided
        const cleanPhone = phone.replace(/\s+/g, "").replace("+", "");
        return /^[0-9]{8,15}$/.test(cleanPhone);
      },
      message: 'Số điện thoại không hợp lệ'
    }
  },
  password: { 
    type: String, 
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'seller', 'customer'],
      message: 'Role phải là admin, seller hoặc customer'
    },
    default: 'customer',
  },
  is_active: { 
    type: Boolean, 
    default: true 
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  phone_verified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: null
  },
  last_login: {
    type: Date,
    default: null
  },
  login_attempts: {
    type: Number,
    default: 0
  },
  locked_until: {
    type: Date,
    default: null
  }
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

// Validate that at least one of email or phone is provided
userSchema.pre('validate', function(next) {
  if (!this.email && !this.phone) {
    const error = new Error('Phải có ít nhất email hoặc số điện thoại');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.locked_until && this.locked_until > Date.now());
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours

  // If we have a previous lock that has expired, restart at 1
  if (this.locked_until && this.locked_until < Date.now()) {
    return this.updateOne({
      $unset: { locked_until: 1 },
      $set: { login_attempts: 1 }
    });
  }

  const updates = { $inc: { login_attempts: 1 } };
  
  // If we have hit max attempts and it's not locked yet, lock the account
  if (this.login_attempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { locked_until: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { login_attempts: 1, locked_until: 1 }
  });
};

// Static method to find by email or phone
userSchema.statics.findByEmailOrPhone = function(identifier) {
  const cleanIdentifier = identifier.trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier);
  
  if (isEmail) {
    return this.findOne({ email: cleanIdentifier.toLowerCase() });
  } else {
    const cleanPhone = cleanIdentifier.replace(/\s+/g, "").replace("+", "");
    return this.findOne({ phone: cleanPhone });
  }
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ is_active: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);