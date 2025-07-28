import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import type { Room } from "../types/room";
import styles from "./RoomDetail.module.css";
import { useAuth } from "../hooks/useAuth";

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`/api/v1/rooms/${id}`);
        setRoom(res.data);
      } catch (err) {
        console.error("Lỗi khi tải phòng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleBookingClick = () => {
    if (!user) {
      alert("⚠️ Bạn cần đăng nhập để đặt phòng!");
      navigate("/auth");
      return;
    }

    if (!room) return;
    navigate(`/booking/${room._id}`, { state: { room } });
  };

  if (loading) return <div className={styles.loading}>Đang tải phòng...</div>;
  if (!room) return <div className={styles.error}>Không tìm thấy phòng.</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{room.name}</h1>
      <p className={styles.hotelName}>
        🏨 Khách sạn: {typeof room.hotel_id === "object" && "name" in room.hotel_id 
          ? room.hotel_id.name 
          : "Không rõ"}
      </p>

      <div className={styles.imageGallery}>
        {room.images.map((img, i) => (
          <img key={i} src={img} alt={`Room image ${i}`} />
        ))}
      </div>

      <p className={styles.price}>💰 Giá mỗi đêm: <strong>{room.price} VND</strong></p>
      <p className={styles.guests}>👥 Tối đa: {room.max_guests} khách</p>
      <p className={styles.amenities}>🛋️ Tiện nghi: {room.amenities.join(", ")}</p>

      <button className={styles.bookButton} onClick={handleBookingClick}>
        Đặt phòng ngay
      </button>
    </div>
  );
}