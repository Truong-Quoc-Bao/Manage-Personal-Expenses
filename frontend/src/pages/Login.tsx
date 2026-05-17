import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { authApi, getAuthErrorMessage, takeAccessToken } from "../api/auth.api";

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const hadToken = !!localStorage.getItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (hadToken) {
      toast.success("Đã đăng xuất thành công!", { duration: 3000 });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }

      const { data } = await authApi.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const token = takeAccessToken(data);
      if (!token) {
        toast.error("Phản hồi đăng nhập không hợp lệ (thiếu token).");
        return;
      }

      localStorage.setItem("token", token);
      toast.success("Đăng nhập thành công!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-3xl bg-white p-8 shadow-xl md:p-9">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-3xl text-white shadow-lg">
              💰
            </div>
            <h1 className="mb-1 text-3xl font-semibold text-gray-900">
              Đăng nhập
            </h1>
            <p className="text-base text-gray-500">
              Kiểm soát chi tiêu, nắm bắt tài chính
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-base font-medium text-gray-800">
                Email hoặc Tên đăng nhập
              </label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-2xl border border-gray-300 px-4 py-4 text-lg text-gray-900 placeholder:text-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Nhập email hoặc tên đăng nhập"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-medium text-gray-800">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-2xl border border-gray-300 px-4 py-4 pr-14 text-lg text-gray-900 placeholder:text-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-base">
              <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <Link
                to="/forgot-password"
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 py-4 text-xl font-semibold text-white shadow-lg transition-all hover:from-orange-600 hover:to-rose-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-7 text-center text-base text-gray-500">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-orange-600 hover:text-orange-700"
            >
              Đăng ký ngay
            </Link>
          </div>
      </div>
    </div>
  );
}
