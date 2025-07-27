export interface Room {
  _id: string;
  hotel_id: string;
  name: string;
  price: number;
  max_guests: number;
  amenities: string[];
  images: string[];
  created_at: string;
}