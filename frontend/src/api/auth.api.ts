import axios from 'axios';
import axiosInstance from './axiosInstance';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  user_name: string;
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/** Khớp AuthService (camelCase JSON) hoặc PascalCase */
export interface LoginResponseBody {
  token?: string;
  Token?: string;
}

export function takeAccessToken(body: LoginResponseBody | undefined): string | null {
  if (!body) return null;
  if (typeof body.token === 'string' && body.token) return body.token;
  if (typeof body.Token === 'string' && body.Token) return body.Token;
  return null;
}

export function getAuthErrorMessage(
  error: unknown,
  fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.'
): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      return 'Email hoặc mật khẩu không đúng.';
    }

    if (typeof data === 'string' && data.trim()) {
      return data.trim();
    }

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.detail === 'string' && record.detail.trim()) {
        return record.detail.trim();
      }
      if (typeof record.message === 'string' && record.message.trim()) {
        return record.message.trim();
      }
      if (typeof record.title === 'string' && record.title.trim()) {
        return record.title.trim();
      }

      const tryCollect = (items: unknown): string | null => {
        if (!Array.isArray(items)) return null;
        const parts = items
          .map((item) => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object' && 'description' in item) {
              const d = (item as { description?: unknown }).description;
              return typeof d === 'string' ? d : null;
            }
            return null;
          })
          .filter((x): x is string => Boolean(x));
        return parts.length ? parts.join(', ') : null;
      };

      const fromArray = tryCollect(data);
      if (fromArray) return fromArray;

      if (Array.isArray(record.errors)) {
        const nested = tryCollect(record.errors);
        if (nested) return nested;
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export const authApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<LoginResponseBody>('/api/auth/login', data),
  register: (data: RegisterRequest) =>
    axiosInstance.post<string | unknown>('/api/auth/register', data),
  forgotPassword: (email: string) =>
    axiosInstance.post('/api/auth/forgot-password', { email }),
  resetPassword: (data: ResetPasswordRequest) =>
    axiosInstance.post('/api/auth/reset-password', data),
};