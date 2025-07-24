import React, { useState } from "react";
import styles from "./Home.module.css";

const MOCK = [
  { id: 1, title: "Khách sạn Luxury", location: "Hà Nội", price: "2.500.000đ" },
  { id: 2, title: "Resort Beachside", location: "Đà Nẵng", price: "3.000.000đ" },
  { id: 3, title: "Villa Mountain", location: "Đà Lạt", price: "2.000.000đ" },
  { id: 4, title: "City Hotel", location: "TP.HCM", price: "1.800.000đ" },
];

export default function Home() {
  const [search, setSearch] = useState("");

  const filtered = MOCK.filter(h =>
    h.title.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Tìm khách sạn hoàn hảo cho bạn</h1>
          <input
            type="text"
            placeholder="Nhập thành phố hoặc tên khách sạn..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.search}
          />
        </div>
      </section>

      <section className={styles.listSection}>
        <h2 className={styles.sectionTitle}>Gợi ý dành cho bạn</h2>
        <div className={styles.grid}>
          {filtered.map(hotel => (
            <div key={hotel.id} className={styles.card}>
              <div className={styles.image} />
              <div className={styles.info}>
                <h3>{hotel.title}</h3>
                <p>{hotel.location}</p>
                <p className={styles.price}>{hotel.price}/đêm</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}