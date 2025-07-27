import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import type { Hotel } from "../types/hotel";
import type { Room } from "../types/room";
import styles from "./HotelDetail.module.css";

export default function HotelDetail() {
  const { id } = useParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotelAndRooms = async () => {
      try {
        const [hotelRes, roomsRes] = await Promise.all([
          axios.get(`/api/v1/hotels/${id}`),
          axios.get(`/api/v1/rooms?hotel_id=${id}`),
        ]);
        setHotel(hotelRes.data);
        setRooms(roomsRes.data || []);
      } catch (err) {
        console.error("Error fetching hotel or rooms", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotelAndRooms();
  }, [id]);

  if (loading) return <div>Đang tải...</div>;
  if (!hotel) return <div>Không tìm thấy khách sạn.</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{hotel.name}</h1>
      <p className={styles.location}>📍 {hotel.location}</p>
      <div className={styles.images}>
        {hotel.images.map((img, i) => (
          <img key={i} src={img} alt={`Ảnh ${i}`} />
        ))}
      </div>
      <p className={styles.description}>{hotel.description}</p>

      <h2 className={styles.roomTitle}>Danh sách phòng</h2>
      <div className={styles.roomList}>
        {rooms.map((room) => (
          <div key={room._id} className={styles.roomCard}>
            <h3>{room.name}</h3>
            <p>💰 Giá: {room.price} VND</p>
            <p>👥 Tối đa: {room.max_guests} khách</p>
            <p>Tiện nghi: {room.amenities.join(", ")}</p>
            <div className={styles.roomImages}>
              {room.images.map((img, i) => (
                <img key={i} src={img} alt={`Room ${i}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}