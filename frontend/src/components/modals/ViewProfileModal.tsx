import { X, Mail, Calendar, Edit2, User as UserIcon } from "lucide-react";

type UserProfile = {
  user_id?: string;
  user_name?: string;
  email?: string;
  birth?: string;
};

interface ViewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  user: UserProfile;
}

export function ViewProfileModal({
  isOpen,
  onClose,
  onEdit,
  user,
}: ViewProfileModalProps) {
  if (!isOpen) return null;

  const displayName = user.user_name || "Người dùng";
  const avatarText = displayName.slice(0, 2).toUpperCase();

  const birthText = user.birth
    ? new Date(user.birth).toLocaleDateString("vi-VN")
    : "Chưa cập nhật";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Thông tin cá nhân
          </h2>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl !bg-gray-100 p-2 text-gray-600 hover:!bg-orange-100 hover:text-orange-600"
            >
              <Edit2 className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl !bg-gray-100 p-2 text-gray-600 hover:!bg-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 flex flex-col items-center border-b border-gray-100 pb-6">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-3xl font-semibold text-white shadow-lg">
              {avatarText}
            </div>

            <h3 className="text-xl font-semibold text-gray-900">
              {displayName}
            </h3>
            <p className="text-sm text-gray-500">Thành viên</p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-4 rounded-2xl bg-gray-50 p-4">
              <UserIcon className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Họ và tên</p>
                <p className="text-sm font-medium text-gray-900">
                  {displayName}
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl bg-gray-50 p-4">
              <Mail className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.email || "Chưa có email"}
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl bg-gray-50 p-4">
              <Calendar className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Ngày sinh</p>
                <p className="text-sm font-medium text-gray-900">{birthText}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="mt-6 w-full rounded-2xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg hover:!from-orange-500 hover:!to-rose-500"
          >
            Chỉnh sửa thông tin
          </button>
        </div>
      </div>
    </div>
  );
}
