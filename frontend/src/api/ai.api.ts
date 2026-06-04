import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────
// 🔐 Auth
// ─────────────────────────────────────────
export const authApi = {
  // BE: /login -> FE gọi qua Gateway: /api/ai/login
  login: (data: { username: string; password: string }) =>
    axiosInstance.post('/api/ai/login', data),
};

// ─────────────────────────────────────────
// 📊 Dashboard & Thống kê
// ─────────────────────────────────────────
export const statsApi = {
  // BE: /api/stats -> FE gọi qua Gateway: /api/aistats
  getStats: () => axiosInstance.get('/api/ai/stats'),

  getBudgets: () => axiosInstance.get('/api/ai/budgets'),

  getRecentTransactions: () => axiosInstance.get('/api/ai/recent-transactions'),

  getAllTransactions: () => axiosInstance.get('/api/ai/all-transactions'),
};

// ─────────────────────────────────────────
// 🤖 Chat AI
// ─────────────────────────────────────────
export const chatApi = {
  // BE: /chat-history -> FE gọi qua Gateway: /api/ai/chat-history
  getChatHistory: () => axiosInstance.get('/api/ai/chat-history'),

  // BE: /chat -> FE gọi qua Gateway: /api/ai/chat
  sendMessage: (data: { message: string; model?: string; image?: File }) => {
    const form = new FormData();
    form.append('message', data.message);
    if (data.model) form.append('model', data.model);
    if (data.image) form.append('image', data.image);
    return axiosInstance.post('/api/ai/chat', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },

  getDeepScan: () => axiosInstance.get('/api/ai/ai-deep-scan'),
  getAiHealth: () => axiosInstance.get('/api/ai/ai-health'),
};

// ─────────────────────────────────────────
// 🔔 Thông báo (Notifications)
// ─────────────────────────────────────────
export const notificationApi = {
  // Lưu ý: Nếu Gateway của Bảo đang đẩy /api/notifications sang service khác
  // thì Bảo phải cân nhắc đổi prefix này.
  // Ở đây mình giả định Bảo muốn gọi vào AI Service (4005)
  getAll: () => axiosInstance.get('/api/ai/notifications'),

  markRead: (id: number | string) => axiosInstance.post(`/api/ai/notifications/read/${id}`),

  markAllRead: () => axiosInstance.post('/api/ai/notifications/read-all'),

  deleteOne: (id: number | string) => axiosInstance.delete(`/api/ai/notifications/delete/${id}`),

  deleteAll: () => axiosInstance.delete('/api/ai/notifications/delete-all'),
};

// ─────────────────────────────────────────
// 🏦 Web Push & Ngân hàng
// ─────────────────────────────────────────
export const bankApi = {
  getVapidKey: () => axiosInstance.get('/api/ai/vapid-public-key'),

  subscribe: (subscription: PushSubscription) =>
    axiosInstance.post('/api/ai/subscribe', subscription),

  createBankLink: () => axiosInstance.get('/api/ai/create-bank'),

  receiveBankWebhook: (payload: Record<string, unknown>) =>
    axiosInstance.post('/api/ai/webhook/bank-transfer', payload, {
      headers: { 'x-api-key': 'MY_SUPER_SECRET_KEY' }, // Thêm dòng này để bypass xác thực JWT khi test
    }),

  saveBankAccount: (data: { account_number: string; account_type?: string; bank_name?: string }) =>
    axiosInstance.post('/api/ai/save-bank-account', data),
};

export const debugApi = {
  getSubscriptions: () => axiosInstance.get('/api/ai/debug-subscriptions'),
};
