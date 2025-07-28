// src/components/RoomCard.tsx
import React from "react";
import { Link } from "react-router-dom";

interface RoomProps {
  room: {
    _id: string;
    name: string;
    price: number;
    description: string;
    maxPeople: number;
    hotelName?: string;
  };
}

export default function RoomCard({ room }: RoomProps) {
  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "1rem",
      marginBottom: "1rem"
    }}>
      <h3>{room.name}</h3>
      <p>{room.description}</p>
      <p><strong>Giá:</strong> ${room.price}/đêm</p>
      <p><strong>Sức chứa:</strong> {room.maxPeople} người</p>

      <Link
        to={`/rooms/${room._id}`}
        state={{ hotelName: room.hotelName || "Không rõ" }}
        style={{
          display: "inline-block",
          marginTop: "8px",
          backgroundColor: "#2196f3",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: "500"
        }}
      >
        Xem chi tiết
      </Link>
    </div>
  );
}