// src/config/axiosConfig.ts
import axios from "axios";

// Cấu hình base URL
axios.defaults.baseURL = "http://localhost:5000";

// Interceptor thêm token vào header
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

// Interceptor xử lý khi token hết hạn (jwt expired)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response.data?.message === "jwt expired"
    ) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axios;