import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import type { Room } from "../types/room";
import styles from "./MyBookings.module.css";

interface Booking {
  _id: string;
  room_id: {
    _id: string;
    name: string;
    price: number;
    hotel_id: { name: string } | string;
  };
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  isPaid: boolean;
}

export default function MyBookingsPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const fetchBookings = async () => {
      try {
        const res = await axios.get<Booking[]>("/api/v1/bookings/my");
        setBookings(res.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách đặt phòng.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user, navigate]);

  if (loading) return <p className={styles.message}>⏳ Đang tải...</p>;
  if (error)   return <p className={styles.error}>{error}</p>;
  if (bookings.length === 0)
    return <p className={styles.message}>Bạn chưa có đặt phòng nào.</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📄 Đặt phòng của tôi</h1>
      <div className={styles.list}>
        {bookings.map((b) => {
          const hotelName =
            typeof b.room_id.hotel_id === "object" && "name" in b.room_id.hotel_id
              ? b.room_id.hotel_id.name
              : "Không rõ";
          return (
            <div key={b._id} className={styles.card}>
              <h2 className={styles.roomName}>{b.room_id.name}</h2>
              <p className={styles.hotel}>🏨 {hotelName}</p>
              <p>
                📅 {new Date(b.start_date).toLocaleDateString()} →{" "}
                {new Date(b.end_date).toLocaleDateString()}
              </p>
              <p>💰 Tổng: {b.total_price.toLocaleString()} VND</p>
              <p>
                🏷️ Trạng thái:{" "}
                <span
                  className={
                    b.isPaid ? styles.paidStatus : styles.pendingStatus
                  }
                >
                  {b.isPaid ? "Đã thanh toán" : b.status}
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}