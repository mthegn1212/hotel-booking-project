// src/services/authApi.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth", // đổi nếu khác
});

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) => {
  const res = await API.post("/register", data);
  return res.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const res = await API.post("/login", data);
  return res.data; // { accessToken, user }
};

export const logoutUser = async () => {
  const res = await API.post("/logout");
  return res.data;
};