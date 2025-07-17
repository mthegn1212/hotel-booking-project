import { Link } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>🏨 Hotel Booking</h1>
      <nav className={styles.nav}>
        <Link to="/">Trang chủ</Link>
        <Link to="/auth">Đăng nhập</Link>
        <Link to="/register">Đăng ký</Link>
      </nav>
    </header>
  );
};

export default Header;