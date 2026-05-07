import axiosInstance from "./axiosInstance";

export const categoryApi = {
  getCategories: () => axiosInstance.get("/api/categories/categories"),
};
