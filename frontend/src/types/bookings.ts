// types/booking.ts
import type { Room } from "./room";
import type { Hotel } from "./hotel";

export interface Booking {
  _id: string;
  user_id: string;
  hotel_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  isPaid: boolean;
  paidAt?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  hotel?: Hotel;
  room?: Room;
}