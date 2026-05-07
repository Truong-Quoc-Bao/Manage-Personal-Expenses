import { useEffect, useState } from "react";
import { X, User as UserIcon, Calendar } from "lucide-react";
import { toast } from "sonner";
import { userApi } from "../../api/user.api";

type UserProfile = {
  user_id?: string;
  user_name?: string;
  email?: string;
  birth?: string;
};

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdated: (user: UserProfile) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onUpdated,
}: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    birth: "",
  });

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        userName: user.user_name || "",
        birth: user.birth ? user.birth.split("T")[0] : "",
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userName.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }

    setLoading(true);

    try {
      const res = await userApi.updateProfile({
        userName: formData.userName,
        birth: formData.birth || null,
      });

      const updatedUser = res.data?.data || {
        ...user,
        user_name: formData.userName,
        birth: formData.birth,
      };

      toast.success("Cập nhật thông tin thành công!");
      onUpdated(updatedUser);
    } catch (error) {
      console.error("Update profile failed:", error);
      toast.error("Cập nhật thông tin thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const avatarText = formData.userName
    ? formData.userName.slice(0, 2).toUpperCase()
    : "ND";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Chỉnh sửa thông tin
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl !bg-gray-100 p-2 text-gray-600 hover:!bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-3xl font-semibold text-white shadow-lg">
              {avatarText}
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <UserIcon className="h-4 w-4 text-orange-500" />
              Họ và tên <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
              className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4 text-green-500" />
              Ngày sinh
            </label>

            <input
              type="date"
              value={formData.birth}
              onChange={(e) =>
                setFormData({ ...formData, birth: e.target.value })
              }
              className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-2xl !bg-gray-100 px-6 py-3 font-semibold text-gray-700 hover:!bg-gray-200 disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg hover:!from-orange-500 hover:!to-rose-500 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
