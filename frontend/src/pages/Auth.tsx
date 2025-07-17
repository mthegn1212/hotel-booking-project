// src/pages/Auth.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"start" | "otp" | "register">("start");
  const [otp, setOtp] = useState("");

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/v1/auth/check-email", { email });
      if (res.data.exists) {
        await axios.post("/api/v1/auth/send-otp", { email });
        setStep("otp");
      } else {
        setStep("register");
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/v1/auth/verify-otp", { email, otp });
      const { token } = res.data;
      localStorage.setItem("token", token);
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.error || "Mã OTP không chính xác");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/auth/register", { name: email.split("@")[0], email, password: "12345678", role: "customer" });
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      setStep("otp");
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi đăng ký");
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>Chào mừng bạn!</h2>

        {step === "start" && (
          <form onSubmit={handleStart} className={styles.form}>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
            <button type="submit" className={styles.button}>
              Tiếp tục
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className={styles.form}>
            <input
              type="text"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className={styles.input}
            />
            <button type="submit" className={styles.button}>
              Đăng nhập
            </button>
          </form>
        )}

        {step === "register" && (
          <form onSubmit={handleRegister} className={styles.form}>
            <p>Email <strong>{email}</strong> chưa được đăng ký.</p>
            <button type="submit" className={styles.button}>
              Tạo tài khoản tự động và gửi mã OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}