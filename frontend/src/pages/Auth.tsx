// src/pages/Auth.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaGoogle, FaApple, FaFacebookF } from "react-icons/fa";
import styles from "./Login.module.css";

type Step = 'start' | 'login' | 'register';

export default function Auth() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [isEmail, setIsEmail] = useState(false);
  const [step, setStep] = useState<Step>('start');
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    setIsEmail(emailRegex.test(identifier));
  }, [identifier]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => setCountdown(prev => prev - 1), 1000);
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
      setStep(res.data.exists ? 'login' : 'register');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi hệ thống');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/v1/auth/login", { identifier, password });

      const token = res.data.token;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      alert("Đăng nhập thành công!");
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi khi đăng nhập");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isEmail) {
    window.location.href = `/api/v1/auth/google?email=${encodeURIComponent(identifier)}`;
    return;
  }

  if (password !== confirmPassword) {
    alert("Mật khẩu xác nhận không khớp!");
    return;
  }

  if (!otp.trim()) {
    alert("Vui lòng nhập mã OTP!");
    return;
  }

  try {
    await axios.post("/api/v1/auth/verify-otp", { phone: identifier, otp: otp.trim() });
  } catch (err: any) {
    alert(err.response?.data?.error || "OTP không hợp lệ!");
    return;
  }

  try {
    const payload = {
      name: identifier,
      identifier: identifier,
      password,
      confirmPassword,
      role: 'customer'
    };
    const res = await axios.post("/api/v1/auth/register", payload);
    alert(res.data?.message || "Đăng ký thành công!");
    navigate("/auth");
  } catch (err: any) {
    alert(err.response?.data?.error || "Lỗi khi đăng ký");
  }
};

  const handleSendOTP = async () => {
    try {
      await axios.post("/api/v1/auth/send-otp", { phone: identifier });
      setOtpSent(true);
      setCountdown(60);
      alert("OTP đã được gửi!");
      setTimeout(() => { setOtpSent(false); setCountdown(0); }, 60000);
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi khi gửi OTP");
    }
  };

  const resetToStart = () => {
    setStep('start');
    setIdentifier('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setOtpSent(false);
    setCountdown(0);
  };

  return (
    <div className={styles.overlay} onClick={resetToStart}>
      <div className={styles.wrapper} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={resetToStart}>×</button>
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
            <button type="submit" className={styles.button}>Tiếp tục</button>
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
              Đăng nhập khác
            </button>
          </form>
        )}

        {step === 'register' && (
          isEmail ? (
            <div className={styles.form}>
              <p className={styles.emailLinkText}>Đăng ký qua email:</p>
              <button
                className={`${styles.socialBtn} ${styles.google}`}
                onClick={() => window.location.href = `/api/v1/auth/google?email=${identifier}`}
              >
                <FaGoogle /> <span>Google</span>
              </button>
              <button type="button" className={styles.link} onClick={resetToStart}>
                Đăng ký bằng số điện thoại
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className={styles.form}>
              <div className={styles.identifierDisplay}>
                Đăng ký với: <strong>{identifier}</strong>
              </div>

              <div className={styles.otpRow}>
                <input
                  type="text"
                  placeholder="Mã OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className={styles.input}
                  required
                  maxLength={6}
                />
                <button
                  type="button"
                  className={styles.otpButton}
                  onClick={handleSendOTP}
                  disabled={otpSent || countdown > 0}
                >
                  {countdown > 0 ? `${countdown}s` : otpSent ? "Đã gửi" : "Gửi mã"}
                </button>
              </div>

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

              <button type="submit" className={styles.button}>Đăng ký</button>
              <button
                type="button"
                className={styles.link}
                onClick={() => navigate("/auth")}
              >
                Quay lại trang đăng nhập
              </button>
              <button type="button" className={styles.link} onClick={resetToStart}>
                Đổi phương thức
              </button>
            </form>
          )
        )}

        <div className={styles.orDivider}>Hoặc</div>
        <div className={styles.socialButtons}>
          <button
            className={`${styles.socialBtn} ${styles.google}`}
            onClick={() => window.location.href = "/api/v1/auth/google"}
          >
            <FaGoogle /> <span>Google</span>
          </button>
          <button
            className={`${styles.socialBtn} ${styles.apple}`}
            onClick={() => window.location.href = "/api/v1/auth/apple"}
          >
            <FaApple /> <span>Apple</span>
          </button>
          <button
            className={`${styles.socialBtn} ${styles.facebook}`}
            onClick={() => window.location.href = "/api/v1/auth/facebook"}
          >
            <FaFacebookF /> <span>Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
}