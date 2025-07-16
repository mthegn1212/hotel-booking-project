import { useState } from "react";
import styles from "./LoginForm.module.css";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
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

    const { token, user } = res.data;
    if (formData.rememberMe) {
      localStorage.setItem("token", token);
    } else {
      sessionStorage.setItem("token", token);
    }
    navigate("/");
  } catch (err: any) {
    alert(err.response?.data?.error || "Đăng nhập thất bại!");
  }
};

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Đăng nhập</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            name="rememberMe"
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <label htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
        </div>

        <button type="submit">Đăng nhập</button>

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
  );
};

export default Login;