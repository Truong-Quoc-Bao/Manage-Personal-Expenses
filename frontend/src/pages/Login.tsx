import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Đăng nhập thành công!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[480px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-18 h-18 rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 shadow-lg flex items-center justify-center text-white text-3xl mb-4">
            💰
          </div>
          <h1 className="text-5xl font-semibold text-gray-800 mb-2 text-center">
            Quản Lý Tài Chính
          </h1>
          <p className="text-gray-600 text-center">
            Kiểm soát chi tiêu, nắm bắt tài chính
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-9">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">
              Đăng nhập
            </h2>
            <p className="text-base text-gray-600">
              Chào mừng bạn quay trở lại!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base text-gray-700 mb-2">
                Email hoặc Tên đăng nhập
              </label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-lg"
                placeholder="Nhập email hoặc tên đăng nhập"
                required
              />
            </div>

            <div>
              <label className="block text-base text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-4 pr-14 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-lg"
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
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-orange-500 hover:text-orange-600"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 text-white text-xl font-semibold hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-7 text-center text-base text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
