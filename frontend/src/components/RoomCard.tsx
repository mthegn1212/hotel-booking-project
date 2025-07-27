// src/components/RoomCard.tsx
import React from "react";

interface RoomProps {
  room: {
    _id: string;
    name: string;
    price: number;
    description: string;
    maxPeople: number;
  };
}

export default function RoomCard({ room }: RoomProps) {
  return (
    <div style={{
      border: "1px solid #ccc", borderRadius: "8px", padding: "1rem"
    }}>
      <h3>{room.name}</h3>
      <p>{room.description}</p>
      <p><strong>Giá:</strong> ${room.price}/đêm</p>
      <p><strong>Sức chứa:</strong> {room.maxPeople} người</p>
    </div>
  );
}