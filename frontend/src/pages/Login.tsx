import { useState, useEffect } from "react";
import styles from "./Login.module.css";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
}

const Login = ({ isOpen, onClose }: LoginProps) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/v1/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token } = res.data;
      if (formData.rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      onClose();
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.error || "Đăng nhập thất bại!");
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.wrapper} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>

        <h2 className={styles.title}>Đăng nhập</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            Ghi nhớ đăng nhập
          </label>

          <button type="submit" className={styles.button}>
            Đăng nhập
          </button>

          <div className={styles.divider}>Hoặc</div>

          <div className={styles.socialButtons}>
            <button type="button" className={styles.google}>
              <FaGoogle /> Google
            </button>
            <button type="button" className={styles.facebook}>
              <FaFacebookF /> Facebook
            </button>
          </div>

          <p className={styles.redirect}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;