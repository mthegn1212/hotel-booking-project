export interface HotelShort {
  _id: string;
  name: string;
}

export interface Room {
  _id: string;
  hotel_id: string | HotelShort;
  name: string;
  price: number;
  max_guests: number;
  amenities: string[];
  images: string[];
  created_at: string;
}