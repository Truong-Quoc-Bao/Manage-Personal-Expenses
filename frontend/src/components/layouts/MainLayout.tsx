import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  BarChart3,
  MessageCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Giao dịch", path: "/transactions", icon: Receipt },
    { name: "Tài khoản", path: "/accounts", icon: Wallet },
    { name: "Thống kê", path: "/statistics", icon: BarChart3 },
    { name: "Trợ lý AI", path: "/chatbox", icon: MessageCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[300px] bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[86px] items-center justify-between border-b border-gray-200 px-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <span className="text-2xl font-semibold text-gray-900">
                Tài chính
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg !bg-transparent p-2 text-gray-500 hover:!bg-gray-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="border-b border-gray-200 px-7 py-7">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-xl font-semibold text-white">
                NV
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xl font-medium text-gray-900">
                  Nguyễn Văn A
                </p>
                <p className="truncate text-lg text-gray-500">
                  user@example.com
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-4 overflow-y-auto px-7 py-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-5 rounded-2xl px-5 py-4 text-xl font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-7 w-7" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 px-7 py-6">
            <Link
              to="/"
              className="flex items-center gap-5 rounded-2xl px-5 py-4 text-xl font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-7 w-7" />
              <span>Đăng xuất</span>
            </Link>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[300px]">
        <header className="sticky top-0 z-30 bg-white shadow-sm lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg !bg-transparent p-2 text-gray-600 hover:!bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>

            <span className="font-semibold text-gray-900">Tài chính</span>

            <div className="w-10" />
          </div>
        </header>

        <main className="min-h-screen p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
