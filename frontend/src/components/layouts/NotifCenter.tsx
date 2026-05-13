import React, { useState, useEffect, useRef } from 'react';
import { Bell, Trash2, X, ChevronDown, BellOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { notificationApi, bankApi } from '../../api/ai.api';
import { formatDateTime } from '../../utils/format';
import { socketService } from '../../services/SocketService';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // --- CÁC HÀM BỔ TRỢ ĐỂ CHẠY LOGIC CŨ (KHÔNG XOÁ DÒNG NÀO) ---

  // Thay vì gọi trực tiếp, ta phát tín hiệu để trang Dashboard nghe thấy và load lại
  function updateDashboard() {
    console.log('🔄 Đang phát tín hiệu cập nhật Dashboard...');
    window.dispatchEvent(new Event('dashboard_refresh'));
  }

  // Hàm hiển thị thông báo bay (Toast) chuẩn giao diện cũ
  function showToast(message: string, type: 'success' | 'error' = 'success') {
    console.log(`[Toast ${type}]: ${message}`);
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    toast.className = `fixed top-10 right-10 ${bgColor} text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce font-bold`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // Hàm phát tín hiệu cho ChatBox (để dùng trong socket.on)
  function addMessage(text: string, isUser: boolean) {
    console.log('💬 Đang gửi tin nhắn ngân hàng vào ChatBox...');
    window.dispatchEvent(
      new CustomEvent('ai_add_message', {
        detail: { text, isUser },
      }),
    );
  }
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Giữ nguyên các biến global giả lập từ file JS cũ (nếu cần dùng sau này)
  let isSending = false;
  let myChart = null;
  let dashboardData = null;
  let currentView = 'expense';

  // --- 7. PUSH NOTIFICATION (GIỮ NGUYÊN 100% LOGIC VÀ CONSOLE.LOG) ---
  async function registerPush() {
    try {
      console.log('⏳ Đang khởi tạo Service Worker...');
      const register = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('✅ Service Worker đã đăng ký!');

      const ready = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker sẵn sàng!');

      // ✅ FIX: Dùng bankApi.getVapidKey() thay vì fetch()
      const keyRes = await bankApi.getVapidKey();
      const { publicVapidKey } = keyRes.data;
      console.log('✅ Đã lấy Public VAPID Key');

      let subscription = await ready.pushManager.getSubscription();

      if (!subscription) {
        console.log('🔔 Đang tạo subscription mới...');
        subscription = await ready.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
        console.log('✅ Đã subscribe thành công!');
      } else {
        console.log('🟡 Đã có subscription cũ');
      }

      // ✅ FIX: Dùng bankApi.subscribe() thay vì fetch()
      await bankApi.subscribe(subscription);

      console.log('🚀 Đăng ký Push Notification thành công!');
    } catch (err: any) {
      console.error('❌ Lỗi đăng ký push:', err.message);
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // --- 8. SOCKET.IO & AUDIO (GIỮ NGUYÊN TOÀN BỘ CHỨC NĂNG) ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userHasInteracted = useRef(false);

  function initNotificationAudio() {
    if (!audioRef.current) {
      audioRef.current = new Audio(
        'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
      );
      audioRef.current.volume = 0.75;
    }
  }

  async function playNotificationSound() {
    if (!audioRef.current || !userHasInteracted.current) return;
    try {
      await audioRef.current.play();
    } catch (err) {
      console.log('🔇 Không phát được âm thanh (browser chặn)');
    }
  }

  function enableAudioAfterInteraction() {
    if (userHasInteracted.current) return;
    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    const handler = () => {
      userHasInteracted.current = true;
      initNotificationAudio();
      console.log('✅ Âm thanh đã được kích hoạt');
      events.forEach((event) => document.removeEventListener(event, handler));
    };
    events.forEach((event) => document.addEventListener(event, handler, { once: true }));
  }

  // --- LOAD DATA (HÀM loadNotifications CŨ) ---
  async function loadNotifications() {
    try {
      // ✅ FIX: Dùng notificationApi.getAll() thay vì fetch()
      const res = await notificationApi.getAll();
      const data = res.data; // Axios trả dữ liệu về trong .data
      setNotifications(data);

      const unreadNotifications = data.filter((n: any) => !n.is_read);
      const unreadCount = unreadNotifications.length;
      setUnreadCount(unreadCount);
    } catch (err) {
      console.error('Lỗi loadNotifications:', err);
    }
  }

  useEffect(() => {
    loadNotifications();
    registerPush();
    enableAudioAfterInteraction();

    socketService.connect();

    const handleBankNotification = (data: any) => {
      console.log('🏦 Nhận thông báo ngân hàng:', data);
      addMessage(data.message, false);
      playNotificationSound();
      updateDashboard();
      loadNotifications();
      showToast('💰 Có giao dịch mới từ ngân hàng!', 'success');
    };

    const handleNewNotification = (data: any) => {
      console.log('🔔 Nhận thông báo mới từ socket:', data);
      const notif = {
        id: data.id || Date.now(),
        message: data.message,
        is_read: false,
        created_at: data.time || new Date().toISOString(),
      };
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [notif, ...prev]);
      playNotificationSound();
      showToast('🔔 Bạn có thông báo mới!', 'success');
    };

    socketService.on('bank_notification', handleBankNotification);
    // socketService.on('new_notification', handleNewNotification);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      socketService.off('bank_notification', handleBankNotification);
      // socketService.off('new_notification', handleNewNotification);
    };
  }, []);

  // --- ACTIONS (XÓA/ĐỌC) ---
  async function markAsRead(id: number) {
    try {
      // ✅ FIX: Dùng notificationApi.markRead(id)
      const res = await notificationApi.markRead(id);
      if (res.status === 200 || res.status === 201) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function markAllAsRead() {
    // ✅ FIX: Dùng notificationApi.markAllRead()
    await notificationApi.markAllRead();
    loadNotifications();
  }

  async function deleteNoti(id: number) {
    if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    // ✅ FIX: Dùng notificationApi.deleteOne(id)
    await notificationApi.deleteOne(id);
    loadNotifications();
  }

  async function deleteAllNotifications() {
    if (!confirm('Xóa sạch tất cả thông báo?')) return;
    // ✅ FIX: Dùng notificationApi.deleteAll()
    await notificationApi.deleteAll();
    loadNotifications();
  }

  // --- HÀM toggleNoti (Logic mở rộng và đánh dấu đọc) ---
  async function toggleNoti(id: number, isRead: boolean) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!isRead) {
        await markAsRead(id);
      }
    }
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Nút chuông noti-btn */}
      <button
        id="noti-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        className="text-gray-400 relative p-2 hover:bg-gray-100 rounded-full transition-all"
      >
        <Bell size={24} />
        <span
          id="noti-count"
          className={`absolute top-1 right-1 bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ${
            unreadCount === 0 ? 'hidden' : ''
          }`}
        >
          {unreadCount}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="noti-dropdown"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-lg p-2 z-50 border overflow-hidden"
          >
            {/* Header chứa nút chức năng (Logic JS cũ) */}
            <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10 flex justify-between items-center text-[11px]">
              {unreadCount > 0 ? (
                <button onClick={markAllAsRead} className="text-blue-600 font-bold hover:underline">
                  Đánh dấu tất cả ({unreadCount})
                </button>
              ) : (
                <span className="text-gray-400 font-bold">Không có tin mới</span>
              )}

              <button
                onClick={deleteAllNotifications}
                className="text-red-500 font-bold hover:underline"
              >
                <Trash2 size={12} className="inline mr-1" /> Xóa tất cả ({notifications.length})
              </button>
            </div>

            {/* Cấu trúc render list y chang hàm loadNotifications cũ */}
            <div id="noti-list" className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-400 p-4 text-center">Chưa có thông báo nào</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`border-b transition border-gray-100 ${
                      n.is_read ? 'bg-white' : 'bg-blue-50'
                    }`}
                  >
                    <div
                      id={`noti-header-${n.id}`}
                      onClick={() => toggleNoti(n.id, n.is_read)}
                      className={`p-3 cursor-pointer flex justify-between items-center w-full ${
                        expandedId === n.id ? 'hidden' : 'flex'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <span
                          className={`text-xs font-bold ${
                            n.is_read ? 'text-gray-400' : 'text-gray-900'
                          }`}
                        >
                          {n.is_read ? 'Thông báo cũ' : 'Thông báo mới'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatDateTime(n.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-400">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNoti(n.id);
                          }}
                          className="hover:text-red-500 transition"
                        >
                          <X size={14} />
                        </button>
                        <ChevronDown size={12} />
                      </div>
                    </div>

                    {/* Nội dung chi tiết - Hiện khi expandedId khớp (Thay thế logic toggleNoti JS) */}
                    {expandedId === n.id && (
                      <div
                        id={`noti-content-${n.id}`}
                        className="p-3 text-xs text-gray-700 animate-in fade-in duration-200"
                      >
                        <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                          <p className="mb-3 whitespace-pre-line">
                            {n.message.replace(/\*\*/g, '')}
                          </p>
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setExpandedId(null)}
                              className="text-gray-400 font-bold text-[10px]"
                            >
                              « Thu gọn
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
