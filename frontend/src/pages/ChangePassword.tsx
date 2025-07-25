// src/pages/ChangePassword.tsx
import { useState } from "react";
import axios from "../config/axiosConfig";
import { useNavigate } from "react-router-dom";
import styles from "./ChangePassword.module.css";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới và xác nhận không khớp!");
      return;
    }
    if (oldPassword === newPassword) {
      alert("Mật khẩu mới phải khác mật khẩu cũ!");
      return;
    }

    try {
      await axios.post(
        "/api/v1/auth/change-password",
        { currentPassword: oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi khi đổi mật khẩu");
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>
          <span role="img" aria-label="lock">🔒</span> Đổi mật khẩu
        </h2>

        <label className={styles.label}>
          Mật khẩu cũ
          <input
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
            minLength={6}
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Mật khẩu mới
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={6}
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Xác nhận mật khẩu mới
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className={styles.input}
          />
        </label>

        <button type="submit" className={styles.button}>
          Xác nhận đổi mật khẩu
        </button>
      </form>
    </div>
  );
}