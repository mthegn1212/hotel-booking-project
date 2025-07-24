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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("/api/v1/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          🏨 HotelBooking
        </Link>
        <nav className={styles.nav}>
          <Link to="/" className={styles.link}>Trang chủ</Link>
          {user ? (
            <div className={styles.user}>
              <button onClick={() => setOpen(o => !o)} className={styles.userBtn}>
                👤 {user.name}
              </button>
              {open && (
                <ul className={styles.dropdown}>
                  <li><Link to="/my-bookings">📄 Đặt phòng của tôi</Link></li>
                  <li><Link to="/my-reviews">✍️ Đánh giá của tôi</Link></li>
                  <li><Link to="/change-password">🔒 Đổi mật khẩu</Link></li>
                  <li><button onClick={logout}>🚪 Đăng xuất</button></li>
                </ul>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth" className={styles.link}>Đăng nhập</Link>
              <Link to="/auth" className={styles.link}>Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;