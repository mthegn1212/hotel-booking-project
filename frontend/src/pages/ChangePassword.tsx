// src/pages/ChangePassword.tsx
import { useState } from "react";
import axios from "../config/axiosConfig";

export default function ChangePassword() {
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
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/v1/auth/reset-password",
        {
          token,
          oldPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi khi đổi mật khẩu");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: "2rem",
        maxWidth: "400px",
        margin: "2rem auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>🔒 Đổi mật khẩu</h2>

      <input
        type="password"
        placeholder="Mật khẩu cũ"
        value={oldPassword}
        onChange={e => setOldPassword(e.target.value)}
        required
        minLength={6}
        style={{ display: "block", width: "100%", margin: "0.75rem 0", padding: "0.5rem" }}
      />

      <input
        type="password"
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        required
        minLength={6}
        style={{ display: "block", width: "100%", margin: "0.75rem 0", padding: "0.5rem" }}
      />

      <input
        type="password"
        placeholder="Xác nhận mật khẩu mới"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        required
        minLength={6}
        style={{ display: "block", width: "100%", margin: "0.75rem 0 1.5rem", padding: "0.5rem" }}
      />

      <button
        type="submit"
        style={{
          width: "100%",
          backgroundColor: "#1e40af",
          color: "#fff",
          padding: "0.75rem",
          border: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Xác nhận đổi mật khẩu
      </button>
    </form>
  );
}