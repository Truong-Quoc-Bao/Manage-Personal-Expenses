import { useState } from "react";
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { authApi, getAuthErrorMessage } from "../api/auth.api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email
      if (!email) {
        toast.error("Vui lòng nhập email");
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Email không đúng định dạng");
        setLoading(false);
        return;
      }

      // Mock API call - in real app, this would call a password reset API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock: check if email exists (in real app, backend would handle this)
      // For security reasons, we should show success even if email doesn't exist

      setEmailSent(true);
      toast.success("Đã gửi email đặt lại mật khẩu!");
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl text-gray-800 mb-2">Email đã được gửi!</h2>
          <p className="text-gray-600 mb-6">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email
            <br />
            <strong className="text-gray-800">{email}</strong>
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Vui lòng kiểm tra hộp thư đến hoặc thư rác.
              <br />
              Link đặt lại mật khẩu sẽ hết hạn sau 15 phút.
            </p>
            <div className="pt-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Không nhận được email?{" "}
            <button
              onClick={() => {
                setEmailSent(false);
                toast.info("Bạn có thể gửi lại email");
              }}
              className="text-orange-500 hover:text-orange-600"
            >
              Gửi lại
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại đăng nhập
        </Link>
        <h2 className="text-2xl text-gray-800 mb-2">Quên mật khẩu?</h2>
        <p className="text-sm text-gray-600">
          Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              placeholder="Nhập email của bạn"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-400 to-rose-400 text-white hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Nhớ mật khẩu rồi?{" "}
        <Link to="/" className="text-orange-500 hover:text-orange-600">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
