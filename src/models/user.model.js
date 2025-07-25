const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "owner", "admin"],
      default: "customer",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    login_attempts: {
      type: Number,
      default: 0,
    },
    last_login: {
      type: Date,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Mã hóa password trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const isAlreadyHashed = /^\$2[aby]\$/.test(this.password);
  if (isAlreadyHashed) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// So sánh password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Kiểm tra tài khoản bị khóa
userSchema.methods.isLocked = function () {
  return this.login_attempts >= 5;
};

// Tăng số lần đăng nhập sai
userSchema.methods.incLoginAttempts = function () {
  this.login_attempts += 1;
  return this.save();
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  this.login_attempts = 0;
  return this.save();
};


// Ẩn các trường nhạy cảm khi trả về JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// Tìm theo email hoặc phone
userSchema.statics.findByEmailOrPhone = function (identifier) {
  return this.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });
};

module.exports = mongoose.model("User", userSchema);