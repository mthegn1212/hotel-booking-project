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
  const [isPhone, setIsPhone] = useState(false);
  const [step, setStep] = useState<'start' | 'login' | 'register'>('start');
  const [exists, setExists] = useState<boolean>(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const phoneRegex = /^[0-9]{8,15}$/;
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    setIsPhone(phoneRegex.test(identifier));
    setIsEmail(emailRegex.test(identifier));
  }, [identifier]);

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
      const loginRes = await axios.post("/api/v1/auth/login", { identifier, password });
      localStorage.setItem('token', loginRes.data.token);
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Đăng nhập thất bại');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert('Nhập tên');
    if (!otp) return alert('Nhập mã OTP');
    if (password !== confirmPassword) return alert('Mật khẩu không khớp');
    try {
      const verifyPayload = isEmail ? { email: identifier, otp } : { phone: identifier, otp };
      await axios.post("/api/v1/auth/verify-otp", verifyPayload);
      const registerPayload = isEmail
        ? { name, email: identifier, password, role: 'customer' }
        : { name, phone: identifier, password, role: 'customer' };
      await axios.post("/api/v1/auth/register", registerPayload);
      const loginRes = await axios.post("/api/v1/auth/login", { identifier, password });
      localStorage.setItem('token', loginRes.data.token);
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Đăng ký thất bại');
    }
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
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.button}>Đăng nhập</button>
            <button type="button" className={styles.link} onClick={() => setStep('register')}>Chưa có tài khoản?</button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister} className={styles.form}>
            <input
              type="text"
              placeholder="Họ và tên"
              value={name}
              onChange={e => setName(e.target.value)}
              className={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Mã OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Tạo mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.button}>Đăng ký</button>
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