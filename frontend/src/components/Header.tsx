import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Header.module.css";

type User = {
  name: string;
};

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get("/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>🏨 Hotel Booking</h1>
      <nav className={styles.nav}>
        <Link to="/">Trang chủ</Link>
        {user ? (
          <>
            <span>Xin chào, <strong>{user.name}</strong></span>
            <button onClick={handleLogout} className={styles.logoutBtn}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/auth">Đăng nhập</Link>
            <Link to="/auth">Đăng ký</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;