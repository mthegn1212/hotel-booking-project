// src/pages/Auth.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";

export default function Auth() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState(""); // phone or email
  const [isEmail, setIsEmail] = useState(false);
  const [step, setStep] = useState<'start' | 'login' | 'register'>('start');
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [role, setRole] = useState("customer");

  useEffect(() => {
    const phoneRegex = /^[0-9]{8,15}$/;
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    setIsEmail(emailRegex.test(identifier));
  }, [identifier]);

  // Countdown effect for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleCheckUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = isEmail ? { email: identifier } : { phone: identifier };
      const res = isEmail
        ? await axios.post("/api/v1/auth/check-email", payload)
        : await axios.post("/api/v1/auth/check-phone", payload);
      setExists(res.data.exists);
      setStep(res.data.exists ? 'login' : 'register');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi hệ thống');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = isEmail 
        ? { email: identifier, password }
        : { phone: identifier, password };
      
      console.log("Login Payload:", payload); // <-- Thêm dòng này
      const loginRes = await axios.post("/api/v1/auth/login", payload);
      // ...
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Login Error:", err.response?.data); // <-- Log chi tiết lỗi
        alert(err.response?.data?.error || 'Đăng nhập thất bại');
      } else {
        console.error("Login Error:", err);
        alert('Đăng nhập thất bại');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register Data:", { 
      name, 
      password, 
      confirmPassword, 
      role, 
      identifier,
      isEmail,
      isOTPVerified 
    }); // <-- Log tất cả dữ liệu

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (!isOTPVerified) {
      alert("Vui lòng xác thực OTP trước!");
      return;
    }

    try {
      const payload = {
        name,
        password,
        role,
        [isEmail ? "email" : "phone"]: identifier,
      };

      console.log("Register Payload:", payload); // <-- Log payload
      const res = await axios.post("/api/v1/auth/register", payload);
      // ...
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Register Error:", err.response?.data); // <-- Log chi tiết lỗi
        alert(err.response?.data?.error || "Lỗi khi đăng ký");
      } else {
        console.error("Register Error:", err);
        alert("Lỗi khi đăng ký");
      }
    }
  };

  const handleSendOTP = async () => {
    try {
      const payload = isEmail ? { email: identifier } : { phone: identifier };
      await axios.post("/api/v1/auth/send-otp", payload);
      setOtpSent(true);
      setCountdown(60);
      alert("OTP đã được gửi!");
      
      // Reset OTP sent state after countdown
      setTimeout(() => {
        setOtpSent(false);
        setCountdown(0);
      }, 60000);
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi khi gửi OTP");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      alert("Vui lòng nhập mã OTP!");
      return;
    }

    try {
      const payload = isEmail
        ? { email: identifier, otp: otp.trim() }
        : { phone: identifier, otp: otp.trim() };

      await axios.post("/api/v1/auth/verify-otp", payload);
      setIsOTPVerified(true);
      alert("Xác thực OTP thành công!");
    } catch (err: any) {
      alert(err.response?.data?.error || "OTP không hợp lệ!");
    }
  };

  const resetToStart = () => {
    setStep('start');
    setIdentifier('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setOtpSent(false);
    setIsOTPVerified(false);
    setExists(null);
    setCountdown(0);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>Đăng nhập / Đăng ký</h2>
        
        {step === 'start' && (
          <form onSubmit={handleCheckUser} className={styles.form}>
            <input
              type="text"
              placeholder="Email hoặc số điện thoại"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.button}>
              Tiếp tục
            </button>
          </form>
        )}

        {step === 'login' && (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.identifierDisplay}>
              Đăng nhập với: <strong>{identifier}</strong>
            </div>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.button}>Đăng nhập</button>
            <button type="button" className={styles.link} onClick={() => setStep('register')}>
              Chưa có tài khoản? Đăng ký
            </button>
            <button type="button" className={styles.link} onClick={resetToStart}>
              Đăng nhập bằng tài khoản khác
            </button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.identifierDisplay}>
              Đăng ký với: <strong>{identifier}</strong>
            </div>
            
            <input
              type="text"
              placeholder="Họ và tên"
              value={name}
              onChange={e => setName(e.target.value)}
              className={styles.input}
              required
            />

            <div className={styles.otpRow}>
              <input
                type="text"
                placeholder="Mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={styles.input}
                required
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleSendOTP}
                className={styles.otpButton}
                disabled={otpSent || countdown > 0}
              >
                {countdown > 0 ? `${countdown}s` : otpSent ? "Đã gửi" : "Gửi mã"}
              </button>
            </div>

            {otp && !isOTPVerified && (
              <button
                type="button"
                onClick={handleVerifyOTP}
                className={styles.verifyButton}
              >
                Xác thực OTP
              </button>
            )}

            {isOTPVerified && (
              <div className={styles.otpVerified}>✓ OTP đã được xác thực</div>
            )}

            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className={styles.input}
              required
            >
              <option value="customer">Khách hàng</option>
              <option value="seller">Người bán</option>
            </select>

            <input
              type="password"
              placeholder="Tạo mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              required
              minLength={6}
            />
            
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
              minLength={6}
            />
            
            <button 
              type="submit" 
              className={styles.button}
              disabled={!isOTPVerified}
            >
              Đăng ký
            </button>
            
            <button type="button" className={styles.link} onClick={() => setStep('login')}>
              Đã có tài khoản? Đăng nhập
            </button>
            <button type="button" className={styles.link} onClick={resetToStart}>
              Sử dụng email/số điện thoại khác
            </button>
          </form>
        )}

        <div className={styles.orDivider}>hoặc đăng nhập/đăng ký với</div>
        <div className={styles.socialButtons}>
          {['apple', 'google', 'facebook'].map(provider => (
            <button
              key={provider}
              onClick={() => window.location.href = `/api/v1/auth/${provider}`}
              className={styles.socialBtn}
            >
              <span>{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
              <i className={`fab fa-${provider}${provider === 'facebook' ? '-f' : ''}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}