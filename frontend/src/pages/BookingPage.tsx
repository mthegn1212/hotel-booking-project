import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axiosConfig";
import styles from "./BookingPage.module.css";
import { AuthContext } from "../context/AuthContext";
import type { Room } from "../types/room";

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const [room, setRoom] = useState<Room | null>(location.state?.room || null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(!room);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!room) {
      const fetchRoom = async () => {
        try {
          const res = await axios.get(`/api/v1/rooms/${id}`);
          setRoom(res.data);
        } catch (err) {
          console.error(err);
          setError("Không thể tải thông tin phòng.");
        } finally {
          setLoading(false);
        }
      };
      fetchRoom();
    }
  }, [id, room]);

  const calculateTotal = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && room ? diffDays * room.price : 0;
  };

  const handleBooking = async () => {
    if (!user) {
      alert("Bạn cần đăng nhập để đặt phòng.");
      navigate("/auth");
      return;
    }

    if (!startDate || !endDate) {
      alert("Vui lòng chọn ngày nhận và trả phòng.");
      return;
    }

    try {
      await axios.post("/api/v1/bookings", {
        room_id: id,
        start_date: startDate,
        end_date: endDate,
      });

      alert("🎉 Đặt phòng thành công!");
      navigate("/my-bookings");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Lỗi khi đặt phòng.");
      } else {
        console.error("Lỗi không xác định:", err);
        alert("Đã có lỗi xảy ra.");
      }
    }
  };

  if (loading) return <p>⏳ Đang tải thông tin phòng...</p>;
  if (!room) return <p>❌ {error || "Không tìm thấy phòng."}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📦 Đặt phòng: {room.name}</h1>
      <p className={styles.hotel}>
        🏨 Khách sạn: {typeof room.hotel_id === "object" && "name" in room.hotel_id
          ? room.hotel_id.name
          : "Không rõ"}
      </p>
      <p className={styles.price}>
        💰 Giá mỗi đêm: <strong>{room.price.toLocaleString()} VND</strong>
      </p>

      <div className={styles.form}>
        <label>
          📅 Ngày nhận phòng:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          📅 Ngày trả phòng:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        {startDate && endDate && (
          <p className={styles.total}>
            🧾 Tổng tiền: <strong>{calculateTotal().toLocaleString()} VND</strong>
          </p>
        )}

        <button onClick={handleBooking} className={styles.bookBtn}>
          🚀 Đặt ngay
        </button>
      </div>
    </div>
  );
}