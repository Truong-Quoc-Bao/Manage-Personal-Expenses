import axiosInstance from "./axiosInstance";

type UpdateAccountPayload = {
  accountId: string;
  accountName: string;
  type: string;
};

export const accountApi = {
  getAccounts: () => axiosInstance.get("/api/accounts"),

  createAccount: (data: any) => axiosInstance.post("/api/accounts", data),

  updateAccount: ({ accountId, accountName, type }: UpdateAccountPayload) =>
    axiosInstance.put(
      "/api/accounts",
      { accountName, type },
      {
        params: { accountId },
      }
    ),

  deleteAccount: (params: { accountId: string }) =>
    axiosInstance.delete("/api/accounts", { params }),

  getTotalBalance: () => axiosInstance.get("/api/accounts/total-balance"),
};
