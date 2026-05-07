// import axios from 'axios';

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // export default axiosInstance;

// import axios from "axios";

// const getBaseURL = () => {
//   const envURL = import.meta.env.VITE_API_GATEWAY_URL;

//   // Browser chạy local không hiểu host "gateway"
//   if (window.location.hostname === "localhost") {
//     return "http://localhost:3000";
//   }

//   return envURL || "http://localhost:3000";
// };
import axios from 'axios';

const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_GATEWAY_URL;

  // Browser chạy local không hiểu host "gateway"
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  }

  return envURL || 'http://localhost:3000';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
