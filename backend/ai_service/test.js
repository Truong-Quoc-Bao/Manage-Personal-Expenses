// ==========================================
// 1. KHAI BÁO CÁC BIẾN DOM
// ==========================================
import React, { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

declare const marked: { parse: (text: string) => string };
declare const Chart: any;

const chatMessages = document.getElementById('chat-messages') as HTMLDivElement;
const chatForm = document.getElementById('chat-form') as HTMLFormElement;
const userInput = document.getElementById('user-input') as HTMLInputElement;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const uploadBtn = document.getElementById('upload-btn') as HTMLButtonElement;
const imagePreviewContainer = document.getElementById('image-preview-container') as HTMLDivElement;
const imagePreviewImg = document.getElementById('image-preview-img') as HTMLImageElement;
const removeImgBtn = document.getElementById('remove-img-btn') as HTMLButtonElement;
const notiBtn = document.getElementById('noti-btn') as HTMLButtonElement;
const notiDropdown = document.getElementById('noti-dropdown') as HTMLDivElement;
const notiList = document.getElementById('noti-list') as HTMLDivElement;
const notiCount = document.getElementById('noti-count') as HTMLSpanElement;
let isSending: boolean = false;
let myChart: any = null;
let dashboardData: DashboardData | null = null;
let currentView: 'expense' | 'income' = 'expense';

// ==========================================
// INTERFACES / TYPES
// ==========================================
interface CategoryData {
  category_name: string;
  amount: number;
}

interface DashboardData {
  month: number;
  year: number;
  income: number;
  expense: number;
  incomeCategories: CategoryData[];
  expenseCategories: CategoryData[];
  categories?: CategoryData[];
}

interface Transaction {
  type: 'income' | 'expense';
  description?: string;
  category_name?: string;
  amount: number;
  created_at: string;
}

interface Budget {
  amount_limit?: number;
  spent?: number;
  icon?: string;
  category_name: string;
}

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface AIModel {
  name: string;
  status: 'online' | 'offline';
}

interface AIInfo {
  modelUsed?: string;
  tokens?: number;
  cost?: number;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokenCount?: number;
  };
}

interface ChatResponse {
  reply: string;
  modelUsed?: string;
  cost?: number;
  usage?: {
    totalTokenCount?: number;
    inputTokens?: number;
    outputTokens?: number;
  };
}

interface VapidKeyResponse {
  publicVapidKey: string;
}

interface BankLinkResponse {
  url: string;
}

interface SuggestionItem {
  icon: string;
  text: string;
}

interface DeepScanData {
  [key: string]: any;
}

// ==========================================
// 2. HÀM HỖ TRỢ
// ==========================================
// Định dạng tiền tệ

// Animation cho số tiền
function animateValue(element: HTMLElement, start: number, end: number, duration: number): void {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      element.textContent = formatMoney(end);
      clearInterval(timer);
    } else {
      element.textContent = formatMoney(Math.floor(current));
    }
  }, 16);
}
// --- 2.1 CẬP NHẬT SỨC KHỎE NÃO BỘ AI ---
// ==========================================
// 3. CẬP NHẬT DASHBOARD
// ==========================================
// ==========================================
// 4. VẼ BIỂU ĐỒ
// ==========================================
// ==========================================
// 5. TẢI GIAO DỊCH GẦN ĐÂY
// ==========================================

// Ngân sách

// ==========================================
// 6. LIÊN KẾT NGÂN HÀNG
// ==========================================

// ==========================================
// 7. PUSH NOTIFICATION
// ==========================================
async function registerPush(): Promise<void> {
  try {
    console.log('⏳ Đang khởi tạo Service Worker...');
    const register = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('✅ Service Worker đã đăng ký!');
    const ready = await navigator.serviceWorker.ready;
    console.log('✅ Service Worker sẵn sàng!');
    const keyRes = await fetch('/vapid-public-key');
    if (!keyRes.ok) throw new Error('Không lấy được VAPID key');
    const { publicVapidKey }: VapidKeyResponse = await keyRes.json();
    console.log('✅ Đã lấy Public VAPID Key');
    let subscription: PushSubscription | null = await ready.pushManager.getSubscription();
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
    await fetch('/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('🚀 Đăng ký Push Notification thành công!');
  } catch (err: any) {
    console.error('❌ Lỗi đăng ký push:', err.message);
  }
}
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
// ==========================================
// 8. SOCKET.IO - NHẬN TIN TỪ NGÂN HÀNG
// ==========================================
const socket: Socket = io();
let notificationAudio: HTMLAudioElement | null = null;
let userHasInteracted: boolean = false;
function initNotificationAudio(): void {
  if (!notificationAudio) {
    notificationAudio = new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
    );
    notificationAudio.volume = 0.75;
  }
}
async function playNotificationSound(): Promise<void> {
  if (!notificationAudio || !userHasInteracted) return;
  try {
    await notificationAudio.play();
  } catch (err) {
    console.log('🔇 Không phát được âm thanh (browser chặn)');
  }
}
function enableAudioAfterInteraction(): void {
  if (userHasInteracted) return;
  const events: string[] = ['click', 'touchstart', 'keydown', 'scroll'];
  const handler = () => {
    userHasInteracted = true;
    initNotificationAudio();
    console.log('✅ Âm thanh đã được kích hoạt');
    events.forEach((event) => document.removeEventListener(event, handler));
  };
  events.forEach((event) => document.addEventListener(event, handler, { once: true }));
}
socket.on('bank_notification', (data: { message: string }) => {
  console.log('🏦 Nhận thông báo ngân hàng:', data);
  addMessage(data.message, false);
  playNotificationSound();
  updateDashboard();
  showToast('💰 Có giao dịch mới từ ngân hàng!', 'success');
});
socket.on('connect', () => {
  console.log('✅ Socket.IO đã kết nối!');
});
socket.on('disconnect', () => {
  console.log('⚠️ Socket.IO đã ngắt kết nối');
});
// Bấm vào chuông thì chỉ hiện/ẩn list thông báo
notiBtn.addEventListener('click', () => {
  // Chỉ đổi trạng thái hiện/ẩn của dropdown
  notiDropdown.classList.toggle('hidden');
  // Nếu dropdown vừa mở ra, thì load dữ liệu mới nhất từ DB
  if (!notiDropdown.classList.contains('hidden')) {
    loadNotifications();
  }
});
// Nhận thông báo từ socket
socket.on('new_notification', (data: { message: string }) => {
  // Cập nhật số trên chuông
  let count = parseInt(notiCount.innerText) || 0;
  notiCount.innerText = String(count + 1);
  notiCount.classList.remove('hidden');
  // Thêm vào list
  const div = document.createElement('div');
  div.className = 'p-2 border-b hover:bg-gray-50';
  div.innerText = data.message;
  notiList.prepend(div);
});
// Hàm đánh dấu đã đọc từngg tin
async function markAsRead(id: number): Promise<void> {
  try {
    const res = await fetch(`/api/notifications/read/${id}`, { method: 'POST' });
    if (res.ok) {
      const header = document.getElementById(`noti-header-${id}`) as HTMLDivElement;
      const statusSpan = header.querySelector('span') as HTMLSpanElement;
      const parentDiv = header.parentElement as HTMLDivElement;
      // Đổi nền về trắng, chữ giữ font-bold nhưng đổi sang màu xám (text-gray-400)
      parentDiv.classList.replace('bg-blue-50', 'bg-white');
      statusSpan.className = 'text-xs font-bold text-gray-400';
      statusSpan.innerText = 'Thông báo cũ';
      // Cập nhật số đếm trên chuông và nút
      let count = parseInt(notiCount.innerText) || 0;
      if (count > 0) {
        const newCount = count - 1;
        notiCount.innerText = String(newCount);
        if (newCount === 0) notiCount.classList.add('hidden');
        const markAllBtn = document.querySelector('button[onclick="markAllAsRead()"]') as HTMLButtonElement | null;
        if (markAllBtn) {
          if (newCount > 0) {
            markAllBtn.innerText = `Đánh dấu tất cả (${newCount})`;
          } else {
            markAllBtn.outerHTML = '<span class="text-gray-400 font-bold">Không có tin mới</span>';
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}
// Hàm đánh dấu đã đọc tất cả tin
async function markAllAsRead(): Promise<void> {
  await fetch('/api/notifications/read-all', { method: 'POST' });
  loadNotifications();
}
// Xóa từng tin
async function deleteNoti(id: number): Promise<void> {
  if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
  await fetch(`/api/notifications/delete/${id}`, { method: 'DELETE' });
  loadNotifications();
}
// Xóa tất cả
async function deleteAllNotifications(): Promise<void> {
  if (!confirm('Xóa sạch tất cả thông báo?')) return;
  await fetch('/api/notifications/delete-all', { method: 'DELETE' });
  loadNotifications();
}
// Load data
async function loadNotifications(): Promise<void> {
  try {
    const res = await fetch('/api/notifications');
    const data: Notification[] = await res.json();
    // Tính số lượng tin chưa đọc
    const unreadNotifications = data.filter((n: Notification) => !n.is_read);
    const unreadCount = unreadNotifications.length;
    const totalCount = data.length;
    // 1. HEADER CHỨA NÚT CHỨC NĂNG (Chỉ hiện nếu có tin)
    let htmlContent = '';
    if (data.length > 0) {
      htmlContent = `
          <div class="p-3 border-b border-gray-100 bg-white sticky top-0 z-10 flex justify-between items-center text-[11px]">
${
  unreadCount > 0
    ? `
                   <button onclick="markAllAsRead()" class="text-blue-600 font-bold hover:underline">
                       Đánh dấu tất cả (${unreadCount})
                   </button>
               `
    : '<span class="text-gray-400 font-bold">Không có tin mới</span>'
}
               <button onclick="deleteAllNotifications()" class="text-red-500 font-bold hover:underline">
                   <i class="fa-solid fa-trash mr-1"></i> Xóa tất cả (${totalCount})
               </button>
           </div>
         `;
    } else {
      htmlContent = '<p class="text-xs text-gray-400 p-4 text-center">Chưa có thông báo nào</p>';
    }
    // 2. Render danh sách thông báo
    htmlContent += data
      .map((n: Notification) => {
        const titleColor = n.is_read ? 'text-gray-400' : 'text-gray-900 font-bold';
        const statusText = n.is_read ? 'Thông báo cũ' : 'Thông báo mới';
        const bgColor = n.is_read ? 'bg-white' : 'bg-blue-50';
        // ... trong hàm map của loadNotifications ...
        return `
                <div class="border-b transition border-gray-100 ${bgColor}">
                    <!-- TIÊU ĐỀ: Dùng flex để dàn hàng ngang -->
                    <div id="noti-header-${n.id}" onclick="toggleNoti(${n.id}, ${n.is_read})" 
                        class="p-3 cursor-pointer flex justify-between items-center w-full">
                        <div class="flex flex-col gap-0.5 overflow-hidden">
                           <span class="text-xs font-bold ${
                             n.is_read ? 'text-gray-400' : 'text-gray-900'
                           }">
${statusText}
                            </span>
                            <span class="text-[10px] text-gray-400">${formatDateTime(
                              n.created_at,
                            )}</span>
                        </div>
                        <!-- NHÓM NÚT BÊN PHẢI -->
                        <div class="flex items-center gap-3 text-gray-400">
                            <!-- Nút Xóa -->
                            <button onclick="event.stopPropagation(); deleteNoti(${
                              n.id
                            })" class="hover:text-red-500 transition text-sm">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                            <!-- Nút Mũi tên -->
                            <i class="fa-solid fa-chevron-down text-[10px]"></i>
                        </div>
                    </div>
                    <!-- NỘI DUNG CHI TIẾT -->
                    <div id="noti-content-${n.id}" class="hidden p-3 pt-0 text-xs text-gray-700">
                        <div class="bg-white p-3 rounded border border-gray-100 shadow-sm">
                            <p class="mb-3">${n.message.replace(/\*\*/g, '')}</p>
                            <div class="flex justify-end gap-3">
                                <button onclick="toggleNoti(${
                                  n.id
                                })" class="text-gray-400 font-bold text-[10px]">« Thu gọn</button>
                                <!-- NÚT ĐÁNH DẤU ĐÃ XÓA Ở ĐÂY -->
                            </div>
                        </div>
                    </div>
                </div>
                `;
      })
      .join('');
    notiList.innerHTML = htmlContent;
    if (unreadCount > 0) {
      notiCount.innerText = String(unreadCount);
      notiCount.classList.remove('hidden');
    } else {
      notiCount.classList.add('hidden');
    }
  } catch (err) {
    console.error('Lỗi loadNotifications:', err);
  }
}
// Hàm này mở/đóng chi tiết thông báo
async function toggleNoti(id: number, isRead?: boolean): Promise<void> {
  const header = document.getElementById(`noti-header-${id}`) as HTMLDivElement;
  const content = document.getElementById(`noti-content-${id}`) as HTMLDivElement;
  // Nếu đang đóng (hidden) -> mở ra
  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    header.classList.add('hidden');
    // Nếu tin chưa đọc, đánh dấu là đã đọc ngay khi mở
    const isUnread = (header.querySelector('span') as HTMLSpanElement).classList.contains('font-bold');
    if (isUnread) {
      await markAsRead(id);
    }
  } else {
    // Nếu đang mở -> đóng lại
    content.classList.add('hidden');
    header.classList.remove('hidden');
  }
}
// ==========================================
// 9. CHAT - XỬ LÝ UPLOAD ẢNH
// ==========================================

// ==========================================
// 10. CHAT - HIỂN THỊ TIN NHẮN
// ==========================================
// function addMessage(text, isUser = false) {
//   const safeText = text || '';
//   const div = document.createElement('div');
//   div.classList.add('message');
//   div.classList.add(isUser ? 'user' : 'bot');
//   if (!isUser) {
//     if (typeof marked !== 'undefined' && safeText.trim() !== '') {
//       div.innerHTML = marked.parse(safeText);
//     } else {
//       div.textContent = safeText || 'Không có phản hồi';
//     }
//   } else {
//     div.textContent = safeText;
//   }
//   chatMessages.appendChild(div);
//   // Smooth scroll to bottom
//   setTimeout(() => {
//     chatMessages.scrollTo({
//       top: chatMessages.scrollHeight,
//       behavior: 'smooth',
//     });
//   }, 100);
// }
// ==========================================
// 10. CHAT - HIỂN THỊ TIN NHẮN (BẢN PRO)
// ==========================================

// ==========================================
// 11. CHAT - GỬI TIN NHẮN
// ==========================================
  // Gửi tin nhắn
  const handleSend = async (textOverride?: string) => {
    const rawContent = textOverride || (showVoicePreview ? voiceTranscript : inputValue);
    const text = rawContent?.trim();

    if ((!text && !selectedImage) || isLoading) return;

    setIsLoading(true);

    // Thêm tin nhắn của Bảo vào màn hình trước
    const userMsg: Message = {
      role: 'user',
      content: text || (selectedImage ? '🖼️ Đang phân tích ảnh...' : ''),
      image: imagePreview || undefined,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Reset ngay lập tức
    setInputValue('');
    setVoiceTranscript('');
    setShowVoicePreview(false);
    const imageToSend = selectedImage;
    setImagePreview(null);
    setSelectedImage(null);

    try {
      const res = await chatApi.sendMessage({
        message: text,
        model: selectedModel,
        image: imageToSend || undefined,
      });

      // Kiểm tra dữ liệu trả về có hợp lệ không
      const replyRaw = res?.data?.reply || '';

      if (!replyRaw) throw new Error('Server không trả về nội dung AI');

      const cleanReply = replyRaw.replace(/<.*?>[\s\S]*?<\/.*?>/gs, '').trim();

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: cleanReply,
          aiInfo: {
            modelUsed: res.data?.modelUsed || 'AI',
            tokens: res.data?.usage?.totalTokenCount || 0,
            cost: res.data?.cost || 0,
            usage: res.data?.usage,
          },
        },
      ]);

      playNotificationSound();
      const msg = new SpeechSynthesisUtterance(cleanReply.substring(0, 500));
      msg.lang = 'vi-VN';
      window.speechSynthesis.speak(msg);

      await refreshDashboard();
    } catch (e: any) {
      console.error('Lỗi gửi tin:', e);

      // Nếu là lỗi timeout (lâu quá)
      if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content:
              'Bác sĩ Moni đang suy nghĩ hơi lâu... Bảo đợi thêm 5-10 giây rồi hãy load lại trang nhé! 🐢',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content:
              'Có lỗi xảy ra, nhưng tin nhắn của Bảo đã được ghi nhận. Thử load lại trang sau vài giây nhé! 😅',
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };
// ==========================================
// 12. TOAST NOTIFICATION
// ==========================================
function showToast(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
  const toast = document.createElement('div');
  const bgColor =
    type === 'success'
      ? 'from-green-500 to-emerald-500'
      : type === 'error'
      ? 'from-red-500 to-pink-500'
      : 'from-blue-500 to-indigo-500';
  toast.className = `fixed top-20 right-6 bg-gradient-to-r ${bgColor} text-white px-6 py-3 rounded-lg shadow-2xl z-50 transform transition-all duration-300 translate-x-full`;
  toast.innerHTML = `
    <div class="flex items-center space-x-2">
      <i class="fa-solid ${
        type === 'success'
          ? 'fa-check-circle'
          : type === 'error'
          ? 'fa-exclamation-circle'
          : 'fa-info-circle'
      }"></i>
      <span class="font-medium">${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  setTimeout(() => {
    toast.style.transform = 'translateX(150%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
// ==========================================
// 13. LOAD LỊCH SỬ CHAT
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/chat-history');
    const history: Array<{ role: string; message: string }> = await res.json();
    history.forEach((msg) => {
      const isUser = msg.role === 'user';
      addMessage(msg.message, isUser);
    });
  } catch (err) {
    console.error('⚠️ Không lấy được lịch sử chat:', err);
  }
});
// ==========================================
// 14. CLICK VÀO CARD ĐỂ ĐỔI BIỂU ĐỒ
// ==========================================
document.addEventListener('click', (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.card.income')) {
    currentView = 'income';
    renderChart('income');
  } else if ((e.target as HTMLElement).closest('.card.expense')) {
    currentView = 'expense';
    renderChart('expense');
  }
});
// ==========================================
// 15. HỆ THỐNG GỢI Ý SIÊU CẤP (30+ KỊCH BẢN LINH HOẠT)
// ==========================================
function getSmartSuggestions(data?: DashboardData | null): SuggestionItem[] {
  const suggestions: SuggestionItem[] = [];
  const income = data?.income || 0;
  const expense = data?.expense || 0;
  const balance = income - expense;
  const categories = data?.categories || [];
  const now = new Date();
  const day = now.getDate();
  const hour = now.getHours();
  const month = now.getMonth() + 1;
  // --- 1. NHÓM: NGƯỜI MỚI (CHƯA CÓ DỮ LIỆU) ---
  if (income === 0 && expense === 0) {
    return [
      { icon: 'fa-rocket', text: 'Bắt đầu hành trình tiết kiệm' },
      { icon: 'fa-link', text: 'Kết nối ngân hàng tự động' },
      { icon: 'fa-camera', text: 'Chụp thử 1 hóa đơn cafe' },
      { icon: 'fa-circle-question', text: 'Money Guard làm được những gì?' },
      { icon: 'fa-user-shield', text: 'Dữ liệu của tôi có an toàn không?' },
    ];
  }
  // --- 2. NHÓM: CẢNH BÁO TÀI CHÍNH (ÂM TIỀN/SẮP HẾT TIỀN) ---
  if (balance < 0) {
    suggestions.push({ icon: 'fa-skull-crossbones', text: 'Kế hoạch trả nợ khẩn cấp' });
    suggestions.push({ icon: 'fa-hand-holding-dollar', text: 'Tìm nguồn thu nhập bổ sung' });
    suggestions.push({ icon: 'fa-ban', text: 'Món nào tôi nên ngừng mua ngay?' });
  } else if (income > 0 && expense / income > 0.9) {
    suggestions.push({ icon: 'fa-triangle-exclamation', text: 'Cảnh báo: Sắp chạm đáy ví!' });
  }
  // --- 3. NHÓM: NGƯỜI GIÀU (DƯ NHIỀU TIỀN) ---
  if (balance > 10000000) {
    // Dư trên 10 triệu
    suggestions.push({ icon: 'fa-coins', text: 'Gợi ý kênh đầu tư an toàn' });
    suggestions.push({ icon: 'fa-gem', text: 'Tôi có thể mua gì tự thưởng cho mình?' });
    suggestions.push({ icon: 'fa-arrow-up-right-dots', text: 'Làm sao để tiền đẻ ra tiền?' });
  }
  // --- 4. NHÓM: THEO THỜI GIAN TRONG NGÀY ---
  if (hour < 10) {
    suggestions.push({ icon: 'fa-mug-saucer', text: 'Kế hoạch chi tiêu hôm nay' });
  } else if (hour > 21) {
    suggestions.push({ icon: 'fa-moon', text: 'Tổng kết chi tiêu ngày hôm nay' });
    suggestions.push({ icon: 'fa-bed', text: 'Ngày mai nên tiêu tối đa bao nhiêu?' });
  }
  // --- 5. NHÓM: THEO CHU KỲ THÁNG (ĐẦU/CUỐI THÁNG) ---
  const daysInMonth = new Date(now.getFullYear(), month, 0).getDate();
  if (day <= 5) {
    suggestions.push({ icon: 'fa-flag', text: `Lập ngân sách cho tháng ${month}` });
    suggestions.push({ icon: 'fa-money-bill-transfer', text: 'Tiền lương của tôi đâu rồi?' });
  } else if (day >= daysInMonth - 5) {
    suggestions.push({ icon: 'fa-hourglass-half', text: 'Sống sót qua những ngày cuối tháng' });
    suggestions.push({ icon: 'fa-file-invoice-dollar', text: 'Dự báo số dư cuối tháng' });
  }
  // --- 6. NHÓM: THEO THÓI QUEN (DANH MỤC) ---
  if (categories.length > 0) {
    const topCat = [...categories].sort((a: CategoryData, b: CategoryData) => b.amount - a.amount)[0];
    const name = topCat.category_name.toLowerCase();
    if (name.includes('ăn') || name.includes('food')) {
      suggestions.push({ icon: 'fa-utensils', text: 'Cắt giảm tiền ăn uống thế nào?' });
    }
    if (name.includes('cafe') || name.includes('nước') || name.includes('coffee')) {
      suggestions.push({ icon: 'fa-cup-togo', text: 'Tôi đã đốt bao nhiêu tiền cho Cafe?' });
    }
    if (name.includes('mua sắm') || name.includes('shopping')) {
      suggestions.push({ icon: 'fa-cart-shopping', text: 'Kiểm soát cơn nghiện mua sắm' });
    }
    if (name.includes('game') || name.includes('giải trí')) {
      suggestions.push({ icon: 'fa-gamepad', text: 'Cân đối tiền nạp game' });
    }
  }
  // --- 7. NHÓM: TRUY VẤN DỮ LIỆU THÔNG MINH ---
  suggestions.push({ icon: 'fa-magnifying-glass-chart', text: 'So sánh với tuần trước' });
  suggestions.push({ icon: 'fa-bolt', text: 'Khoản chi nào bất thường nhất?' });
  suggestions.push({ icon: 'fa-calendar-days', text: 'Thứ mấy tôi tiêu nhiều nhất?' });
  // --- 8. NHÓM: TRUYỀN CẢM HỨNG (MOTIVATION) ---
  suggestions.push({ icon: 'fa-quote-left', text: 'Lời khuyên tài chính hôm nay' });
  suggestions.push({ icon: 'fa-trophy', text: 'Thử thách 7 ngày không trà sữa' });
  // XÁO TRỘN VÀ LẤY 6 CÁI (Tăng số lượng lên 6 cho đẹp giao diện mới)
  return suggestions.sort(() => 0.5 - Math.random()).slice(0, 6);
}
function renderSuggestions(data?: DashboardData | null): void {
  const container = document.getElementById('suggestions-bar') as HTMLDivElement | null;
  if (!container) return;
  const smartList = getSmartSuggestions(data);
  container.innerHTML = '';
  smartList.forEach((item: SuggestionItem) => {
    const chip = document.createElement('div');
    // CSS Class Tailwind mix với Custom style cho chuyên nghiệp
    chip.className =
      'suggestion-chip flex items-center bg-white hover:bg-blue-50 text-gray-700 text-[11px] font-semibold px-4 py-2 rounded-full cursor-pointer transition-all shrink-0 border border-gray-100 shadow-sm hover:border-blue-200 hover:text-blue-600';
    chip.innerHTML = `<i class="fa-solid ${item.icon} mr-2 opacity-70"></i><span>${item.text}</span>`;
    chip.onclick = () => {
      userInput.value = item.text;
      container.style.display = 'none';
      chatForm.dispatchEvent(new Event('submit'));
    };
    container.appendChild(chip);
  });
  container.style.display = 'flex';
}
// ==========================================
// 16. HỆ THỐNG VOICE ASSISTANT (XÁC NHẬN THỦ CÔNG)
// ==========================================

//
//
//

// ==========================================
// 17. KHỞI TẠO KHI TRANG LOAD
// ==========================================

