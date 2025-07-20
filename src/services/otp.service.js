const sendEmail = require("../utils/mailer");
const sendSMS = require("../utils/sms");
const { isEmail } = require("../utils/validate");

// In-memory OTP store (in production, use Redis or database)
const otpStore = new Map();

// OTP configuration
const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 5,
  maxAttempts: 3,
  resendCooldownMinutes: 1
};

// Generate a random OTP
exports.generateOTP = () => {
  const min = Math.pow(10, OTP_CONFIG.length - 1);
  const max = Math.pow(10, OTP_CONFIG.length) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

// Store OTP in memory
exports.storeOTP = async (key, otp) => {
  const cleanKey = key.trim().toLowerCase();
  const expiresAt = Date.now() + (OTP_CONFIG.expiryMinutes * 60 * 1000);
  const canResendAt = Date.now() + (OTP_CONFIG.resendCooldownMinutes * 60 * 1000);
  
  // Get existing data to preserve attempt count
  const existingData = otpStore.get(cleanKey);
  const attempts = existingData?.attempts || 0;
  
  otpStore.set(cleanKey, {
    otp,
    expiresAt,
    canResendAt,
    attempts,
    createdAt: Date.now()
  });

  // Auto cleanup after expiry
  setTimeout(() => {
    otpStore.delete(cleanKey);
  }, OTP_CONFIG.expiryMinutes * 60 * 1000 + 60000); // Extra 1 minute buffer

  return true;
};

// Verify OTP
exports.verify = async (key, inputOtp) => {
  const cleanKey = key.trim().toLowerCase();
  const data = otpStore.get(cleanKey);
  
  if (!data) {
    console.log('OTP not found for key:', cleanKey);
    return false;
  }

  const { otp, expiresAt, attempts } = data;
  const now = Date.now();

  // Check if expired
  if (now > expiresAt) {
    otpStore.delete(cleanKey);
    console.log('OTP expired for key:', cleanKey);
    return false;
  }

  // Check max attempts
  if (attempts >= OTP_CONFIG.maxAttempts) {
    otpStore.delete(cleanKey);
    console.log('Max attempts reached for key:', cleanKey);
    return false;
  }

  // Increment attempt count
  data.attempts = attempts + 1;
  otpStore.set(cleanKey, data);

  // Check OTP match
  const isValid = otp === inputOtp.trim();
  
  if (isValid) {
    otpStore.delete(cleanKey);
    console.log('OTP verified successfully for key:', cleanKey);
  } else {
    console.log('OTP mismatch for key:', cleanKey, 'Expected:', otp, 'Got:', inputOtp.trim());
  }

  return isValid;
};

// Send OTP to user
exports.send = async (key, otp) => {
  const cleanKey = key.trim();
  const isEmailAddress = isEmail(cleanKey);

  try {
    if (isEmailAddress) {
      await this.sendOTPByEmail(cleanKey, otp);
    } else {
      await this.sendOTPBySMS(cleanKey, otp);
    }
    console.log(`OTP sent to ${isEmailAddress ? 'email' : 'phone'}:`, cleanKey);
    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw new Error('Không thể gửi OTP. Vui lòng thử lại!');
  }
};

// Send OTP via email
exports.sendOTPByEmail = async (email, otp) => {
  const subject = "Mã xác thực OTP";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Mã xác thực OTP</h2>
      <p>Chào bạn,</p>
      <p>Mã OTP của bạn là:</p>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
        <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p style="color: #666;">
        Mã này có hiệu lực trong <strong>${OTP_CONFIG.expiryMinutes} phút</strong>. 
        Vui lòng không chia sẻ mã này với bất kỳ ai.
      </p>
      <p style="color: #666; font-size: 12px;">
        Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
      </p>
    </div>
  `;
  
  const text = `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong ${OTP_CONFIG.expiryMinutes} phút.`;

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
};

// Send OTP via SMS
exports.sendOTPBySMS = async (phone, otp) => {
  const message = `Ma OTP cua ban la: ${otp}. Ma co hieu luc trong ${OTP_CONFIG.expiryMinutes} phut. Khong chia se ma nay voi bat ky ai.`;
  
  // In development, just log the SMS
  if (process.env.NODE_ENV === 'development') {
    console.log(`📱 SMS to ${phone}: ${message}`);
    return;
  }

  // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
  try {
    if (sendSMS && typeof sendSMS === 'function') {
      await sendSMS(phone, message);
    } else {
      console.log(`📱 SMS to ${phone}: ${message}`);
      // Throw error in production if SMS service is not configured
      if (process.env.NODE_ENV === 'production') {
        throw new Error('SMS service not configured');
      }
    }
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw new Error('Không thể gửi SMS. Vui lòng thử lại!');
  }
};

// Check if can resend OTP
exports.canResend = (key) => {
  const cleanKey = key.trim().toLowerCase();
  const data = otpStore.get(cleanKey);
  
  if (!data) return true;
  
  return Date.now() > data.canResendAt;
};


// Get remaining time before can resend (in seconds)
exports.getResendCooldown = (key) => {
  const cleanKey = key.trim().toLowerCase();
  const data = otpStore.get(cleanKey);
  
  if (!data || Date.now() > data.canResendAt) return 0;
  
  return Math.ceil((data.canResendAt - Date.now()) / 1000);
};

// Remove OTP from store
exports.removeOTP = (key) => {
  const cleanKey = key.trim().toLowerCase();
  return otpStore.delete(cleanKey);
};

// Get OTP attempts count
exports.getAttempts = (key) => {
  const cleanKey = key.trim().toLowerCase();
  const data = otpStore.get(cleanKey);
  return data ? data.attempts : 0;
};

// Get remaining attempts
exports.getRemainingAttempts = (key) => {
  const attempts = this.getAttempts(key);
  return Math.max(0, OTP_CONFIG.maxAttempts - attempts);
};

// Clean expired OTPs (call this periodically)
exports.cleanExpiredOTPs = () => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(key);
      cleaned++;
    }
  }
  
  console.log(`Cleaned ${cleaned} expired OTPs`);
  return cleaned;
};

// Get store statistics (for debugging)
exports.getStats = () => {
  return {
    totalOTPs: otpStore.size,
    config: OTP_CONFIG
  };
};

// Auto cleanup every 10 minutes
if (process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    exports.cleanExpiredOTPs();
  }, 10 * 60 * 1000);
}