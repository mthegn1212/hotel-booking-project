export interface Hotel {
  _id: string;
  name: string;
  location: string;
  description?: string;
  images: string[];
  owner_id?: string;
  is_published: boolean;
  createdAt: string;
  updatedAt: string;
  minRoomPrice: number;
}
