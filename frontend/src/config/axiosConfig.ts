// src/config/axiosConfig.ts
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000";

// Gắn interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;