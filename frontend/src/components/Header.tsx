import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import styles from "./Header.module.css";

type User = { name: string };

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>🏨 HotelBooking</Link>
        <nav className={styles.nav}>
          <Link to="/" className={styles.link}>Trang chủ</Link>
          {user ? (
            <div className={styles.user} ref={dropdownRef}> {/* <-- ref attached here */}
              <button
                className={styles.userBtn}
                onClick={() => setOpen(prev => !prev)}
              >
                👤 {user.name}
              </button>
              {open && (
                <ul className={styles.dropdown}>
                  <li>
                    <Link
                      to="/my-bookings"
                      className={styles.link}
                      onClick={() => setOpen(false)}
                    >
                      📄 Đặt phòng của tôi
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/my-reviews"
                      className={styles.link}
                      onClick={() => setOpen(false)}
                    >
                      ✍️ Đánh giá của tôi
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/change-password"
                      className={styles.link}
                      onClick={() => setOpen(false)}
                    >
                      🔒 Đổi mật khẩu
                    </Link>
                  </li>
                  <li>
                    <button
                      className={styles.link}
                      onClick={() => {
                        logout();
                        navigate("/");
                        setOpen(false);
                      }}
                    >
                      🚪 Đăng xuất
                    </button>
                  </li>
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