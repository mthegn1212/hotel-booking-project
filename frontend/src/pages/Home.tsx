import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import styles from "./Home.module.css";
import type { Hotel } from "../types/hotel";

export default function Home() {
  const [search, setSearch] = useState("");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/hotels", {
        params: search ? { search: search } : {},
      });
      setHotels(res.data);
    } catch (err) {
      console.error("Lỗi khi fetch hotels:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchHotels();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Tìm khách sạn hoàn hảo cho bạn</h1>
          <input
            type="text"
            placeholder="Nhập thành phố hoặc tên khách sạn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
        </div>
      </section>

      <section className={styles.listSection}>
        <h2 className={styles.sectionTitle}>Gợi ý dành cho bạn</h2>

        {loading ? (
          <p style={{ textAlign: "center" }}>Đang tải khách sạn...</p>
        ) : hotels.length === 0 ? (
          <p style={{ textAlign: "center" }}>Không tìm thấy khách sạn nào phù hợp</p>
        ) : (
          <div className={styles.grid}>
            {hotels.map((hotel) => (
              <div key={hotel._id} className={styles.card}>
                <div className={styles.image}>
                  <img
                    src={hotel.images?.[0] || "https://via.placeholder.com/300x200"}
                    alt={hotel.name}
                    className={styles.hotelImg}
                  />
                </div>
                <div className={styles.info}>
                  <Link to={`/hotels/${hotel._id}`}>
                    <h3>{hotel.name}</h3>
                  </Link>
                  <p>{hotel.location}</p>
                  <p className={styles.price}>
                    {(hotel.minRoomPrice ?? 0).toLocaleString("vi-VN")}đ / đêm
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}