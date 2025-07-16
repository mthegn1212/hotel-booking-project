// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Đã đăng xuất");
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Trang chủ 🎉</h1>
      <p>Chào mừng bạn đến với hệ thống đặt phòng khách sạn</p>
      <button onClick={handleLogout} className={styles.button}>
        Đăng xuất
      </button>
    </div>
  );
}