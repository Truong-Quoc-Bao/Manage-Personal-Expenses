import axiosInstance from "./axiosInstance";

export const userApi = {
  getProfile: () => axiosInstance.get("/api/users/profile"),
  updateProfile: (data: any) => axiosInstance.put("/api/users/profile", data),
};
