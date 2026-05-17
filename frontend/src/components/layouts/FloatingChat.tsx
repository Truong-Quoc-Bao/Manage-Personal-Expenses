import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Send,
  Bot,
  Camera,
  Mic,
  MessageCircle,
  Sparkles,
  Brain,
  Loader2,
  User,
  Zap,
  Trash2,
  Volume2,
  SendHorizontal,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../ui/button';
import { marked } from 'marked';
import { formatMessageTime, formatMoney, formatDateTime } from '../../utils/format.ts';
import { chatApi, statsApi } from '../../api/ai.api';

// --- Interface chuẩn hóa ---
interface Message {
  role: 'user' | 'model';
  content: string;
  image?: string;
  aiInfo?: {
    modelUsed: string;
    tokens: number;
    cost: number;
    usage?: any;
  };
  timestamp: Date;
}

interface AIModel {
  name: string;
  status: 'online' | 'offline';
}

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
export function FloatingChat() {
  // --- States ---
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [stats, setStats] = useState<any>(null);

  // --- Voice & Image States ---
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showVoicePreview, setShowVoicePreview] = useState(false);

  // --- Refs ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);
  const lastMsgRef = useRef('');

  // --- 1. KHỞI TẠO ÂM THANH & TƯƠNG TÁC ---
  useEffect(() => {
    audioRef.current = new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
    );
    audioRef.current.volume = 0.7;
    const interactionHandler = () => {
      hasInteractedRef.current = true;
    };
    window.addEventListener('click', interactionHandler);
    return () => window.removeEventListener('click', interactionHandler);
  }, []);

  const playNotificationSound = () => {
    if (hasInteractedRef.current && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  // --- 1.2 LẮNG NGHE TIN NHẮN TỪ NGÂN HÀNG (Dán dưới useEffect âm thanh) ---
  useEffect(() => {
    const handleBankMessage = (event: any) => {
      const { text, isUser } = event.detail;

      console.log('📨 FloatingChat nhận được tin nhắn từ hệ thống:', text);

      // Thêm tin nhắn mới vào danh sách hiện tại
      setMessages((prev) => {
        // Nếu tin nhắn mới trùng y hệt tin cuối cùng trong danh sách thì bỏ qua
        if (prev.length > 0 && prev[prev.length - 1].content === text) {
          console.log('🚫 Chặn tin nhắn trùng trong FloatingChat');
          return prev;
        }
        return [
          ...prev,
          {
            role: isUser ? 'user' : 'model',
            content: text,
            timestamp: new Date(),
          },
        ];
      });

      // Tự động mở cửa sổ chat nếu đang đóng để Bảo thấy thông báo ngay
      if (!isOpen) {
        setIsOpen(true);
      }

      // Phát âm thanh báo hiệu
      playNotificationSound();

      // Yêu cầu Dashboard cập nhật lại số tiền (vì vừa có giao dịch mới)
      refreshDashboard();
    };

    // Đăng ký nghe sự kiện 'ai_add_message'
    window.addEventListener('ai_add_message', handleBankMessage);

    return () => {
      // Hủy đăng ký khi tắt trang
      window.removeEventListener('ai_add_message', handleBankMessage);
    };
  }, [isOpen]); // Thêm isOpen vào để đảm bảo logic mở cửa sổ hoạt động

  // --- 2. ĐỒNG BỘ DATA & AI HEALTH ---
  useEffect(() => {
    if (isOpen) {
      initChatData();
      const interval = setInterval(syncAIModels, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const initChatData = async () => {
    try {
      const [histRes, statsRes] = await Promise.all([
        chatApi.getChatHistory(),
        statsApi.getStats(),
      ]);

      const history = histRes.data.map((m: any, idx: number) => ({
        id: m.id || `hist-${idx}`, // Nên dùng id từ DB nếu có
        role: m.role === 'user' ? 'user' : 'model',
        content: m.message.replace(/<.*?>[\s\S]*?<\/.*?>/gs, '').trim(),
        timestamp: m.created_at ? new Date(m.created_at) : new Date(),
      }));

      setMessages(
        history.length > 0
          ? history
          : [
              {
                id: 'welcome',
                role: 'model',
                content: 'Xin chào! Tôi là Money Guard. Bạn cần soi ví hay ghi sổ món gì không?',
                timestamp: new Date(),
              },
            ],
      );

      setStats(statsRes.data);
      syncAIModels();
    } catch (e) {
      console.error('Lỗi khởi tạo:', e);
    }
  };

  const syncAIModels = async () => {
    try {
      const res = await chatApi.getAiHealth();
      setAiModels(res.data);
    } catch (e) {
      console.log('Lỗi đồng bộ AI');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, showVoicePreview]);

  // --- 3. SPEECH RECOGNITION (Chuẩn bản cũ) ---
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'vi-VN';
      rec.interimResults = true;
      rec.continuous = false;
      rec.onstart = () => {
        setIsRecording(true);
        setShowVoicePreview(true);
        setVoiceTranscript('Đang nghe...');
      };
      rec.onresult = (event: any) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          final += event.results[i][0].transcript;
        }
        setVoiceTranscript(final);
      };
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
    }
  }, []);

  const handleMicClick = () => {
    if (isRecording) recognitionRef.current?.stop();
    else recognitionRef.current?.start();
  };

  // --- 4. HỆ THỐNG GỢI Ý SIÊU CẤP (Bản fix lỗi biến và logic) ---
  const smartSuggestions = useMemo(() => {
    // Nếu chưa có dữ liệu stats, trả về mặc định
    if (!stats) return [{ icon: 'fa-rocket', text: 'Đang tải gợi ý...' }];

    const sug = [];
    const income = stats.income || 0;
    const expense = stats.expense || 0;
    const balance = income - expense;

    // Lấy danh sách category từ expenseCategories (vì gợi ý thường tập trung vào chi tiêu)
    const categories = stats.expenseCategories || [];
    const budgets = stats.budgets || [];

    const now = new Date();
    const day = now.getDate();
    const hour = now.getHours();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // --- 1. NHÓM QUẢN LÝ DANH MỤC & NGÂN SÁCH (MỚI) ---
    sug.push({ icon: 'fa-plus', text: 'Tạo danh mục chi tiêu mới' });

    if (budgets.length === 0) {
      sug.push({ icon: 'fa-wallet', text: 'Đặt ngân sách tháng này' });
    } else {
      sug.push({ icon: 'fa-chart-pie', text: 'Tháng này tôi đã dùng bao nhiêu ngân sách?' });
    }

    // --- 2. NHÓM: NGƯỜI MỚI (CHƯA CÓ DỮ LIỆU) ---
    if (income === 0 && expense === 0) {
      return [
        { icon: 'fa-rocket', text: 'Bắt đầu hành trình tiết kiệm' },
        { icon: 'fa-link', text: 'Kết nối ngân hàng tự động' },
        { icon: 'fa-camera', text: 'Chụp thử 1 hóa đơn cafe' },
        { icon: 'fa-circle-question', text: 'Money Guard làm được những gì?' },
        { icon: 'fa-user-shield', text: 'Dữ liệu của tôi có an toàn không?' },
        { icon: 'fa-plus', text: 'Tạo danh mục chi tiêu đầu tiên' },
        { icon: 'fa-wallet', text: 'Thiết lập ngân sách tháng' },
      ].slice(0, 6);
    }

    // --- 3. NHÓM: CẢNH BÁO TÀI CHÍNH (ÂM TIỀN/SẮP HẾT TIỀN) ---
    if (balance < 0) {
      sug.push({ icon: 'fa-skull-crossbones', text: 'Kế hoạch trả nợ khẩn cấp' });
      sug.push({ icon: 'fa-hand-holding-dollar', text: 'Tìm nguồn thu nhập bổ sung' });
      sug.push({ icon: 'fa-ban', text: 'Món nào tôi nên ngừng mua ngay?' });
    } else if (income > 0 && expense / income > 0.9) {
      sug.push({ icon: 'fa-triangle-exclamation', text: 'Cảnh báo: Sắp chạm đáy ví!' });
    }

    // --- 4. NHÓM: NGƯỜI GIÀU (DƯ NHIỀU TIỀN) ---
    if (balance > 10000000) {
      sug.push({ icon: 'fa-coins', text: 'Gợi ý kênh đầu tư an toàn' });
      sug.push({ icon: 'fa-gem', text: 'Tôi có thể mua gì tự thưởng cho mình?' });
      sug.push({ icon: 'fa-arrow-up-right-dots', text: 'Làm sao để tiền đẻ ra tiền?' });
    }

    // --- 5. NHÓM: THEO THỜI GIAN TRONG NGÀY ---
    if (hour < 10) {
      sug.push({ icon: 'fa-mug-saucer', text: 'Kế hoạch chi tiêu hôm nay' });
    } else if (hour > 21) {
      sug.push({ icon: 'fa-moon', text: 'Tổng kết chi tiêu ngày hôm nay' });
      sug.push({ icon: 'fa-bed', text: 'Ngày mai nên tiêu tối đa bao nhiêu?' });
    }

    // --- 6. NHÓM: THEO CHU KỲ THÁNG (ĐẦU/CUỐI THÁNG) ---
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day <= 5) {
      sug.push({ icon: 'fa-flag', text: `Lập ngân sách cho tháng ${month}` });
      sug.push({ icon: 'fa-money-bill-transfer', text: 'Tiền lương của tôi đâu rồi?' });
    } else if (day >= daysInMonth - 5) {
      sug.push({ icon: 'fa-hourglass-half', text: 'Sống sót qua những ngày cuối tháng' });
      sug.push({ icon: 'fa-file-invoice-dollar', text: 'Dự báo số dư cuối tháng' });
    }

    // --- 7. NHÓM: THEO THÓI QUEN (DANH MỤC) ---
    if (categories.length > 0) {
      // Tìm hạng mục chi nhiều nhất
      const topCat = [...categories].sort((a, b) => b.amount - a.amount)[0];
      const name = (topCat.category_name || '').toLowerCase();

      sug.push({ icon: 'fa-pen', text: `Sửa tên danh mục ${name}` });
      sug.push({ icon: 'fa-trash', text: `Xóa danh mục không cần thiết` });

      if (name.includes('ăn') || name.includes('food')) {
        sug.push({ icon: 'fa-utensils', text: 'Cắt giảm tiền ăn uống thế nào?' });
      }
      if (name.includes('cafe') || name.includes('nước') || name.includes('coffee')) {
        sug.push({ icon: 'fa-cup-togo', text: 'Tôi đã đốt bao nhiêu tiền cho Cafe?' });
      }
      if (name.includes('mua sắm') || name.includes('shopping')) {
        sug.push({ icon: 'fa-cart-shopping', text: 'Kiểm soát cơn nghiện mua sắm' });
      }
      if (name.includes('game') || name.includes('giải trí')) {
        sug.push({ icon: 'fa-gamepad', text: 'Cân đối tiền nạp game' });
      }
    }

    // --- 8. NHÓM: TRUY VẤN DỮ LIỆU THÔNG MINH ---
    sug.push({ icon: 'fa-magnifying-glass-chart', text: 'So sánh với tuần trước' });
    sug.push({ icon: 'fa-bolt', text: 'Khoản chi nào bất thường nhất?' });
    sug.push({ icon: 'fa-calendar-days', text: 'Thứ mấy tôi tiêu nhiều nhất?' });

    // --- 9. NHÓM: TRUYỀN CẢM HỨNG (MOTIVATION) ---
    sug.push({ icon: 'fa-quote-left', text: 'Lời khuyên tài chính hôm nay' });
    sug.push({ icon: 'fa-trophy', text: 'Thử thách 7 ngày không trà sữa' });

    // XÁO TRỘN VÀ LẤY 6 CÁI NGẪU NHIÊN ĐỂ GIAO DIỆN LUÔN MỚI MẺ
    return sug.sort(() => 0.5 - Math.random()).slice(0, 6);
  }, [stats]);

  // 5. HÀM CẬP NHẬT DASHBOARD (Fix từ bản Vanilla JS sang React-safe) ---
  const refreshDashboard = async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Không thể tải dữ liệu');
      const data = await res.json();

      // 1. Cập nhật state nội bộ của Chat (nếu có)
      setStats(data);

      // 2. CẬP NHẬT CÁC ELEMENT NGOÀI DASHBOARD (Giữ nguyên logic cũ)
      const headerTitle = document.querySelector(
        '.dashboard-header h1',
      ) as HTMLHeadingElement | null;
      if (headerTitle) {
        headerTitle.innerText = `📊 Thống kê Tháng ${data.month}/${data.year}`;
      }

      const dateEl = document.getElementById('current-date');
      if (dateEl) {
        dateEl.innerText =
          'Cập nhật: ' +
          new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          });
      }

      // Cập nhật số liệu và chạy Animation (Gọi các hàm global đã khai báo ở đầu file)
      const incomeEl = document.getElementById('total-income');
      const expenseEl = document.getElementById('total-expense');
      const balanceEl = document.getElementById('total-balance');

      if (incomeEl && expenseEl && balanceEl) {
        const oldIncome = parseFloat((incomeEl as any).dataset.value || '0');
        const oldExpense = parseFloat((expenseEl as any).dataset.value || '0');

        (incomeEl as any).dataset.value = data.income;
        (expenseEl as any).dataset.value = data.expense;

        // Gọi hàm animateValue (đảm bảo hàm này có tồn tại ở scope bên ngoài hoặc định nghĩa lại)
        if (typeof (window as any).animateValue === 'function') {
          (window as any).animateValue(incomeEl, oldIncome, data.income, 800);
          (window as any).animateValue(expenseEl, oldExpense, data.expense, 800);
          (window as any).animateValue(
            balanceEl,
            oldIncome - oldExpense,
            data.income - data.expense,
            800,
          );
        } else {
          // Fallback nếu không thấy hàm animateValue
          incomeEl.textContent = formatMoney(data.income);
          expenseEl.textContent = formatMoney(data.expense);
          balanceEl.textContent = formatMoney(data.income - data.expense);
        }
      }

      // 3. VẼ LẠI BIỂU ĐỒ & GIAO DỊCH (Giữ nguyên chức năng)
      if (typeof (window as any).renderChart === 'function') {
        (window as any).renderChart((window as any).currentView || 'expense');
      }

      if (typeof (window as any).loadRecentTransactions === 'function') {
        await (window as any).loadRecentTransactions();
      }

      if (typeof (window as any).loadBudgets === 'function') {
        await (window as any).loadBudgets();
      }
    } catch (err) {
      console.error('❌ Lỗi refresh dashboard:', err);
    }
  };

  // 6.
  let myChart: any = null;

  /**
   * Hàm vẽ biểu đồ - Đã fix để chạy an toàn trong React
   */
  function renderChart(type: 'expense' | 'income'): void {
    // Lấy data từ biến global hoặc state truyền vào
    const data = (window as any).dashboardData;
    if (!data) {
      console.warn('⚠️ Chưa có dữ liệu dashboard để vẽ biểu đồ');
      return;
    }

    const canvas = document.getElementById('expenseChart') as HTMLCanvasElement | null;
    const noDataMsg = document.getElementById('no-data-msg') as HTMLDivElement | null;
    const titleEl = document.querySelector('.chart-section h3') as HTMLHeadingElement | null;

    // Nếu không tìm thấy canvas (có thể do đang ở trang khác), thoát hàm để không gây lỗi crash
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (myChart) {
      myChart.destroy();
      myChart = null;
    }

    const dataToRender = type === 'income' ? data.incomeCategories : data.expenseCategories;

    if (!dataToRender || dataToRender.length === 0) {
      canvas.style.display = 'none';
      if (noDataMsg) noDataMsg.style.display = 'flex';
      if (titleEl) {
        titleEl.innerText = type === 'income' ? 'Chưa có thu nhập ☘️' : 'Chưa có chi tiêu ✨';
      }
      return;
    }

    canvas.style.display = 'block';
    if (noDataMsg) noDataMsg.style.display = 'none';
    if (titleEl) {
      titleEl.innerText = type === 'income' ? '💰 Phân tích thu nhập' : '💸 Phân tích chi tiêu';
    }

    const colors =
      type === 'income'
        ? ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']
        : ['#ec4899', '#f472b6', '#f59e0b', '#fbbf24', '#60a5fa', '#818cf8', '#a78bfa'];

    const ChartLib = (window as any).Chart;
    if (!ChartLib) {
      console.error('❌ Không tìm thấy thư viện Chart.js');
      return;
    }

    myChart = new ChartLib(ctx, {
      type: 'doughnut',
      data: {
        labels: dataToRender.map((c: any) => c.category_name),
        datasets: [
          {
            data: dataToRender.map((c: any) => c.amount),
            backgroundColor: colors,
            hoverOffset: 20,
            borderWidth: 3,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeInOutQuart',
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              font: { size: 11 },
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            callbacks: {
              label: function (context: any) {
                const label = context.label || '';
                // Định dạng tiền tệ VND
                const value = new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(context.parsed);
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  (window as any).renderChart = renderChart;

  // 7.
  /**
   * Tải và hiển thị danh sách giao dịch gần đây
   * Đã fix để không bị crash nếu Element không tồn tại trên màn hình
   */
  async function loadRecentTransactions(): Promise<void> {
    // 1. Tìm container với kiểu kiểm tra an toàn
    const container = document.getElementById('recent-transactions') as HTMLDivElement | null;

    // Nếu không tìm thấy container (ví dụ Bảo đang ở trang khác trang Dashboard),
    // thoát hàm thay vì báo lỗi crash
    if (!container) return;

    try {
      const res = await fetch('/api/recent-transactions');
      if (!res.ok) throw new Error('Không thể tải giao dịch');

      const transactions: Transaction[] = await res.json();

      // 2. Xử lý trường hợp không có dữ liệu
      if (!transactions || transactions.length === 0) {
        container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-32 text-gray-400">
          <i class="fa-solid fa-inbox text-3xl mb-2"></i>
          <p class="text-xs italic">Chưa có giao dịch nào</p>
        </div>
      `;
        return;
      }

      // 3. Render danh sách (Giữ nguyên logic và CSS của bạn)
      container.innerHTML = transactions
        .slice(0, 20) // Lấy tối đa 20 cái
        .map((t: Transaction) => {
          const isIncome = t.type === 'income';
          const iconColor = isIncome ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50';
          const icon = isIncome ? 'fa-arrow-down' : 'fa-arrow-up';
          const amountColor = isIncome ? 'text-green-600' : 'text-red-600';

          // Đảm bảo hàm formatMoney và formatDateTime có tồn tại
          const displayMoney =
            typeof formatMoney === 'function'
              ? formatMoney(Math.abs(t.amount))
              : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  Math.abs(t.amount),
                );

          const displayTime =
            typeof formatDateTime === 'function' ? formatDateTime(t.created_at) : t.created_at;

          return `
          <div class="transaction-item flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-full ${iconColor} flex items-center justify-center shadow-sm shrink-0">
                <i class="fa-solid ${icon} text-sm"></i>
              </div>
              <div class="overflow-hidden">
                <p class="text-sm font-medium text-gray-800 truncate" style="max-width: 180px;" title="${
                  t.description || t.category_name
                }">
                  ${t.description || t.category_name || 'Khác'}
                </p>
                <div class="flex items-center text-[10px] text-gray-500 mt-1">
                  <span class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 mr-2 border border-gray-200">
                    ${t.category_name || 'Khác'}
                  </span>
                  <span>${displayTime}</span>
                </div>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold ${amountColor}">
                ${isIncome ? '+' : '-'}${displayMoney}
              </p>
            </div>
          </div>
        `;
        })
        .join('');
    } catch (err) {
      console.error('❌ Lỗi tải giao dịch:', err);
      if (container) {
        container.innerHTML = `
        <div class="flex items-center justify-center h-32 text-red-500 text-xs">
          <i class="fa-solid fa-exclamation-triangle mr-2"></i>
          Không thể tải dữ liệu
        </div>
      `;
      }
    }
  }

  (window as any).loadRecentTransactions = loadRecentTransactions;

  // 8.
  /**
   * Tải và hiển thị ngân sách (Budget)
   * Đã fix để chạy an toàn trong môi trường React
   */
  async function loadBudgets(): Promise<void> {
    // 1. Tìm container với kiểm tra null (tránh lỗi khi chuyển trang)
    const container = document.getElementById('budget-container') as HTMLDivElement | null;

    if (!container) return;

    try {
      const res = await fetch('/api/budgets');
      // Nếu API chưa tồn tại trên server, fetch sẽ lỗi, catch sẽ xử lý
      if (!res.ok) throw new Error('Không thể tải ngân sách');

      const budgets: Budget[] = await res.json();

      // 2. Xử lý trường hợp danh sách trống
      if (!budgets || budgets.length === 0) {
        container.innerHTML =
          '<p class="text-xs text-gray-400 italic p-2 text-center">Chưa có ngân sách nào được thiết lập</p>';
        return;
      }

      // 3. Render HTML (Giữ nguyên logic màu sắc và phần trăm của bạn)
      container.innerHTML = budgets
        .map((b: Budget) => {
          const limit = b.amount_limit || 0;
          const spent = parseFloat(String(b.spent || 0));

          // Tính toán % đã tiêu dùng
          const percent = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;

          // Logic màu sắc thanh tiến độ: >90% đỏ, >70% vàng, còn lại xanh
          const colorClass =
            percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-yellow-500' : 'bg-green-500';

          // Hàm helper định dạng tiền tệ an toàn
          const format = (val: number) => {
            if (typeof formatMoney === 'function') {
              return formatMoney(val).replace('₫', '').trim();
            }
            return new Intl.NumberFormat('vi-VN').format(val);
          };

          return `
        <div class="flex flex-col mb-4 last:mb-0">
            <div class="flex justify-between items-center mb-1">
                <div class="flex items-center text-xs">
                    <span class="mr-2 text-sm">${b.icon || '📁'}</span>
                    <span class="font-semibold text-gray-700">${b.category_name}</span>
                </div>
                <div class="text-[10px] text-gray-500 font-bold">
                    ${format(spent)} / ${limit > 0 ? format(limit) : '∞'}
                </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2 shadow-inner overflow-hidden">
                <div class="${colorClass} h-full rounded-full transition-all duration-700 ease-out" 
                     style="width: ${percent}%">
                </div>
            </div>
            <div class="flex justify-end mt-0.5">
                <span class="text-[9px] ${
                  percent >= 90 ? 'text-red-500 font-bold' : 'text-gray-400'
                }">${percent}%</span>
            </div>
        </div>
      `;
        })
        .join('');
    } catch (err) {
      console.warn('⚠️ Lỗi load ngân sách (Có thể do API chưa sẵn sàng):', err);
      if (container) {
        container.innerHTML =
          '<p class="text-[10px] text-gray-400 italic p-2 text-center">Chưa có dữ liệu ngân sách</p>';
      }
    }
  }

  (window as any).loadBudgets = loadBudgets;

  // 9.

  /**
   * Khởi tạo chức năng liên kết ngân hàng
   * Fix lỗi không tìm thấy element trong React và quản lý trạng thái hiển thị
   */
  const initBankLinking = () => {
    const btnLinkBank = document.getElementById('btn-link-bank') as HTMLButtonElement | null;
    const loadingState = document.getElementById('loading-state') as HTMLDivElement | null;
    const errorState = document.getElementById('error-state') as HTMLDivElement | null;
    const errorMessage = document.getElementById('error-message') as HTMLParagraphElement | null;

    // Nếu không tìm thấy nút bấm (có thể Bảo đang ở trang khác), thoát hàm
    if (!btnLinkBank) return;

    // Xóa listener cũ để tránh việc click 1 cái chạy 2 lần (double events)
    const newBtn = btnLinkBank.cloneNode(true) as HTMLButtonElement;
    btnLinkBank.parentNode?.replaceChild(newBtn, btnLinkBank);

    newBtn.addEventListener('click', async function () {
      try {
        // 1. Trạng thái bắt đầu: Hiện loading, ẩn nút và lỗi
        newBtn.style.display = 'none';
        if (loadingState) loadingState.style.display = 'block';
        if (errorState) errorState.style.display = 'none';

        console.log('🔗 Đang tạo magic link liên kết ngân hàng...');

        // 2. Gọi API tạo link
        const response = await fetch('/api/create-bank', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || 'demo'}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Server từ chối yêu cầu');
        }

        const data: BankLinkResponse = await response.json();
        console.log('✅ Đã lấy được link, đang chuyển hướng...');

        // 3. Chuyển hướng người dùng sang trang của Ngân hàng/Đối tác
        window.location.href = data.url;
      } catch (error: any) {
        console.error('❌ Lỗi tạo link ngân hàng:', error);

        // 4. Trạng thái lỗi: Hiện lại nút để thử lại, hiện thông báo lỗi
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'block';
        if (errorMessage) errorMessage.textContent = error.message;
        newBtn.style.display = 'block';

        // Hiển thị thông báo Toast nếu hàm showToast có tồn tại
        if (typeof (window as any).showToast === 'function') {
          (window as any).showToast(error.message, 'error');
        }
      }
    });
  };

  // Đưa vào window để có thể gọi lại bất cứ lúc nào
  (window as any).initBankLinking = initBankLinking;

  // Gọi ngay khi file load (vẫn giữ logic cũ cho các trang HTML tĩnh)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBankLinking);
  } else {
    initBankLinking();
  }

  // 10.
  /**
   * Khởi tạo bộ xử lý Upload ảnh cho Chat
   * Đã fix: Thêm kiểm tra Null để không gây lỗi trang web
   */
  function initImageUploadHandlers() {
    const uploadBtn = document.getElementById('upload-btn') as HTMLButtonElement | null;
    const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
    const imagePreviewContainer = document.getElementById(
      'image-preview-container',
    ) as HTMLDivElement | null;
    const imagePreviewImg = document.getElementById('image-preview-img') as HTMLImageElement | null;
    const removeImgBtn = document.getElementById('remove-img-btn') as HTMLButtonElement | null;

    // 1. Sự kiện nhấn nút Upload (Mở hộp chọn file)
    if (uploadBtn && fileInput) {
      uploadBtn.onclick = () => fileInput.click();
    }

    // 2. Sự kiện khi đã chọn file xong (Hiện ảnh xem trước)
    if (fileInput) {
      fileInput.onchange = () => {
        const file = fileInput.files?.[0];
        if (file && imagePreviewImg && imagePreviewContainer) {
          // Tạo đường dẫn tạm thời cho ảnh
          const url = URL.createObjectURL(file);
          imagePreviewImg.src = url;
          imagePreviewContainer.style.display = 'flex'; // Hiện khung preview

          // Giải phóng bộ nhớ khi ảnh đã load (Tối ưu nhẹ)
          imagePreviewImg.onload = () => URL.revokeObjectURL(url);
        }
      };
    }

    // 3. Sự kiện nhấn nút X (Xóa ảnh đã chọn)
    if (removeImgBtn && fileInput && imagePreviewContainer) {
      removeImgBtn.onclick = () => {
        fileInput.value = ''; // Xóa giá trị trong input file
        imagePreviewContainer.style.display = 'none'; // Ẩn khung preview
        if (imagePreviewImg) imagePreviewImg.src = '';
      };
    }
  }

  // Gọi hàm khởi tạo
  initImageUploadHandlers();

  // Đưa ra window để Chat AI có thể gọi reset sau khi gửi tin nhắn thành công
  (window as any).resetImageUpload = () => {
    const container = document.getElementById('image-preview-container');
    const input = document.getElementById('file-input') as HTMLInputElement;
    if (container) container.style.display = 'none';
    if (input) input.value = '';
  };

  // 11.

  const addMessage = (text: string, isUser: boolean = false, aiInfo: any = null) => {
    const newMessage: Message = {
      role: isUser ? 'user' : 'model',
      content: text || (isUser ? '' : 'Money Guard không có phản hồi'),
      aiInfo: aiInfo
        ? {
            modelUsed: aiInfo.modelUsed,
            tokens: aiInfo.tokens || aiInfo.usage?.totalTokenCount || 0,
            cost: aiInfo.cost || 0,
            usage: aiInfo.usage,
          }
        : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  // Các hàm indicator chỉ đơn giản là chỉnh State
  const showTypingIndicator = () => setIsLoading(true);
  const removeTypingIndicator = () => setIsLoading(false);

  //
  //
  //
  /**
   * Chạy tính năng AI Deep Scan (Bác sĩ Moni khám sức khỏe tài chính)
   * Đã fix: Chống lỗi null element và giữ nguyên 100% logic hiển thị
   */
  async function runDeepScan(): Promise<void> {
    console.log('🚀 [UI] Khởi động Bác sĩ Moni - Deep Scan...');

    // 1. Lấy các phần tử DOM với kiểm tra an toàn
    const modal = document.getElementById('scan-modal') as HTMLDivElement | null;
    const loading = document.getElementById('scan-loading') as HTMLDivElement | null;
    const result = document.getElementById('scan-result') as HTMLDivElement | null;

    // Nếu không tìm thấy Modal (có thể do chưa render), thoát hàm
    if (!modal || !loading || !result) {
      console.error('🚨 Không tìm thấy các phần tử Modal Scan trong DOM');
      return;
    }

    // 2. Trạng thái bắt đầu: Hiện Modal, hiện Loading, ẩn Result
    modal.classList.remove('hidden');
    loading.classList.remove('hidden');
    result.classList.add('hidden');

    try {
      // 3. Gọi API Deep Scan
      console.log('📡 [UI] Đang gửi yêu cầu phân tích chuyên sâu tới Server...');
      const res = await fetch('/api/ai-deep-scan');

      console.log('📡 [UI] Server phản hồi Status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ [UI] Dữ liệu lỗi từ Server:', errorData);
        throw new Error(errorData.error || `Lỗi hệ thống (${res.status})`);
      }

      const data: DeepScanData = await res.json();
      console.log('💎 [UI] Dữ liệu nhận được:', data);

      // 4. ĐIỀN DỮ LIỆU VÀO HTML (Giữ nguyên và tối ưu hóa)
      // Giả sử các ID bên dưới tồn tại trong HTML của Bảo
      const setElText = (id: string, text: string) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
      };

      const setElHtml = (id: string, html: string) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
      };

      // Điền các thông tin phân tích (Ví dụ các ID phổ biến Bảo thường dùng)
      if (data) {
        setElText('scan-score', data.score || '80');
        setElText('scan-status', data.status || 'Ổn định');
        setElHtml(
          'scan-analysis',
          typeof marked !== 'undefined' ? marked.parse(data.analysis || '') : data.analysis || '',
        );
        setElHtml(
          'scan-advice',
          typeof marked !== 'undefined' ? marked.parse(data.advice || '') : data.advice || '',
        );

        // Nếu có danh sách các điểm cần lưu ý
        const alertList = document.getElementById('scan-alerts');
        if (alertList && data.alerts) {
          alertList.innerHTML = data.alerts
            .map((a: string) => `<li class="text-red-500 mb-1">⚠️ ${a}</li>`)
            .join('');
        }
      }

      // 5. Kết thúc: Ẩn Loading, hiện Kết quả
      loading.classList.add('hidden');
      result.classList.remove('hidden');

      // Hiện Toast thành công nếu có
      if (typeof (window as any).showToast === 'function') {
        (window as any).showToast('Bác sĩ Moni đã khám xong!', 'success');
      }
    } catch (err: any) {
      console.error('🚨 [UI] LỖI KHI FETCH DEEP SCAN:', err);

      // Đóng modal và báo lỗi
      modal.classList.add('hidden');

      // Dùng Alert theo đúng yêu cầu bản gốc của Bảo
      alert(`Bác sĩ Moni bị ngất do lỗi: ${err.message}`);

      if (typeof (window as any).showToast === 'function') {
        (window as any).showToast('Khám sức khỏe thất bại', 'error');
      }
    }
  }

  // Export ra window để nút bấm HTML bên ngoài gọi được
  (window as any).runDeepScan = runDeepScan;

  /**
   * Hàm đóng Modal Scan
   */
  function closeScanModal(): void {
    const modal = document.getElementById('scan-modal');
    if (modal) modal.classList.add('hidden');
  }
  (window as any).closeScanModal = closeScanModal;

  //
  //
  //
  const handleSend = async (textOverride?: string) => {
    // 1. Kiểm tra điều kiện gửi
    const message = textOverride || inputValue.trim();
    const file = selectedImage;

    // Nếu không có cả chữ lẫn ảnh, hoặc đang load thì không gửi
    if ((!message && !file) || isLoading) return;

    setIsLoading(true);

    // 2. Hiển thị tin nhắn người dùng (Optimistic UI)
    const userMsg: Message = {
      role: 'user',
      content: message || (file ? '🖼️ Phân tích hình ảnh này giúp mình...' : ''),
      image: imagePreview || undefined,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Reset Input & Preview ngay lập tức để người dùng cảm thấy tốc độ
    setInputValue('');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowVoicePreview(false);

    try {
      // 3. GỌI API QUA CHAT-API WRAPPER (Sửa lại chỗ này)
      // Truyền trực tiếp các field, Wrapper sẽ tự đóng gói FormData cho bạn
      const res = await chatApi.sendMessage({
        message: message,
        model: selectedModel,
        image: file || undefined,
      });

      // Lấy dữ liệu từ res.data (Cấu trúc chuẩn của API wrapper bạn dùng)
      const data = res.data;
      if (!data || !data.reply) throw new Error('Không nhận được phản hồi từ AI');

      const replyRaw = data.reply;

      // 4. [TÍNH NĂNG ẨN] Phân tích giao dịch ngầm (Giữ nguyên)
      const allMatches = [...replyRaw.matchAll(/<transaction>(.*?)<\/transaction>/gs)];
      if (allMatches.length > 0) {
        try {
          const transactions = allMatches.map((m: any) => JSON.parse(m[1].trim()));
          console.log(`🎯 [AI TRÍCH XUẤT ${transactions.length} GIAO DỊCH]:`);
          console.table(transactions);
        } catch (e) {
          console.error('🚨 Lỗi parse giao dịch ngầm từ tag XML');
        }
      }

      // 5. Làm sạch nội dung hiển thị (Xóa tag XML)
      const cleanReply = replyRaw.replace(/<.*?>[\s\S]*?<\/.*?>/gs, '').trim();

      // 6. Cập nhật tin nhắn Bot & Bảng Token Industrial
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: cleanReply,
          aiInfo: {
            modelUsed: data.modelUsed || 'AI',
            tokens: data.usage?.totalTokenCount || 0,
            cost: data.cost || 0,
            usage: data.usage,
          },
          timestamp: new Date(),
        },
      ]);

      // 7. Cảnh báo tài chính (Toast)
      if (replyRaw.includes('🚨') || replyRaw.includes('⚠️')) {
        if (typeof (window as any).showToast === 'function') {
          (window as any).showToast('Money Guard vừa đưa ra cảnh báo tài chính!', 'error');
        }
      }

      // 8. Phản hồi giọng nói (Speak)
      if (typeof (window as any).speakResponse === 'function') {
        (window as any).speakResponse(cleanReply);
      }

      // 9. CẬP NHẬT DASHBOARD (Quan trọng nhất để nhảy số tiền)
      // Chúng ta gọi hàm refresh đã fix ở các bước trước
      console.log('📢 AI vừa ghi sổ! Đang yêu cầu các trang cập nhật...');
      window.dispatchEvent(new Event('money-guard-sync'));

      // Vẫn gọi hàm refresh dashboard tại chỗ cho chắc ăn
      if (typeof (window as any).refreshDashboard === 'function') {
        (window as any).refreshDashboard();
      }
      // if (typeof (window as any).refreshDashboard === 'function') {
      //   await (window as any).refreshDashboard();
      // }
      else {
        // Fallback: nếu không thấy hàm trên window, thử gọi hàm load nội bộ nếu có
        console.log('🔄 Đang cập nhật dữ liệu...');
      }
    } catch (err: any) {
      console.error('🚨 Lỗi Chat:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `🚨 Lỗi: ${err.message || 'Server bận'}. Bạn thử lại nhé!`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  //
  //
  //
  /**
   * Hàm khởi tạo toàn bộ hệ thống Money Guard
   * Đã fix: Tự động đợi DOM sẵn sàng và kiểm tra lỗi từng bước
   */
  async function initializeMoneyGuard() {
    console.log('⏳ Đang khởi tạo các module tài chính...');

    // 1. Cập nhật dữ liệu Dashboard & Ngân sách
    if (typeof (window as any).refreshDashboard === 'function') {
      (window as any).refreshDashboard();
    } else if (typeof updateDashboard === 'function') {
      updateDashboard();
    }

    if (typeof loadBudgets === 'function') loadBudgets();

    // 2. Hệ thống thông báo & Âm thanh
    if (typeof loadNotifications === 'function') loadNotifications();
    if (typeof enableAudioAfterInteraction === 'function') enableAudioAfterInteraction();

    // 3. AI & Suggestions
    if (typeof renderSuggestions === 'function') renderSuggestions();

    if (typeof updateAIHealth === 'function') {
      updateAIHealth();
      // Dọn dẹp interval cũ nếu có để tránh rác bộ nhớ
      if ((window as any).aiHealthInterval) clearInterval((window as any).aiHealthInterval);
      (window as any).aiHealthInterval = setInterval(updateAIHealth, 30000);
    }

    // 4. Đăng ký Push Notification (Delay 2s để ưu tiên UI load trước)
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      if (typeof registerPush === 'function') {
        setTimeout(registerPush, 2000);
      }
    }

    // 5. ANIMATION CHO CÁC CARD (Phần quan trọng nhất)
    // Dùng setTimeout 500ms để chắc chắn React đã vẽ xong các thẻ .card
    setTimeout(() => {
      const cards = document.querySelectorAll('.card');
      console.log(`✨ Đang kích hoạt hiệu ứng cho ${cards.length} thẻ tài chính`);

      cards.forEach((card: Element, index: number) => {
        const htmlCard = card as HTMLElement;
        // Gán delay để các card hiện ra lần lượt (Stagger effect)
        htmlCard.style.animationDelay = `${index * 0.1}s`;
        // Nếu card có class ẩn, hãy hiện nó ra
        htmlCard.classList.add('animate-in');
      });
    }, 500);

    console.log('🎉 Money Guard Dashboard đã sẵn sàng!');
  }

  // check bao nhiêu con online
  const onlineCount = aiModels.filter((m) => m.status === 'online').length;
  const selectedModelLabel =
    selectedModel === 'auto'
      ? 'Auto'
      : selectedModel.split('-').pop()?.toUpperCase() || selectedModel;

  // XỬ LÝ SỰ KIỆN LOAD (Đảm bảo chạy đúng dù là React hay HTML tĩnh)
  if (document.readyState === 'complete') {
    initializeMoneyGuard();
  } else {
    window.addEventListener('load', initializeMoneyGuard);
  }

  // Export ra window để Bảo có thể gọi lệnh "Reset toàn bộ" nếu cần
  (window as any).reInitAll = initializeMoneyGuard;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-4 flex h-[620px] w-[380px] flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-5">
          {/* Header - Blue Messenger Style */}
          <div className="!bg-gradient-to-r !from-orange-400 !to-rose-400 p-4 flex justify-between items-center text-white shrink-0 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-[15px] leading-tight">Money Guard AI</h2>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-white/70">
                    {onlineCount > 0 ? `${onlineCount} model online` : 'Đang kết nối...'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-white text-gray-900 px-2 py-1 rounded-full border border-white/20 transition-all">
                <Brain size={12} className="mr-1 opacity-70" />
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className=" text-[10px] font-black outline-none cursor-pointer uppercase appearance-none"
                >
                  <option value="auto" className="text-gray-900">
                    🤖 AUTO
                  </option>
                  {aiModels.map((m) => (
                    <option
                      key={m.name}
                      value={m.name}
                      className="text-gray-900"
                      disabled={m.status !== 'online'}
                    >
                      {m.status === 'online' ? '🟢' : '🔴'} {m.name.split('-').pop()?.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="!border-0
                !ring-0
                !outline-none
            
                focus:!outline-none
                focus:!ring-0
                focus-visible:!ring-0
                focus-visible:!border-0
            
                active:!scale-95
                active:!ring-0
                active:!border-0
            
                shadow-none
            
                [-webkit-tap-highlight-color:transparent]  !bg-white/2001 hover:!bg-white/3011 !border-0 !ring-0 focus-visible:!ring-0 focus-visible:!border-0 outline-none shadow-none "
              >
                <X className="text-white " size={20} />
              </Button>
            </div>
          </div>

          {/* Vùng tin nhắn */}
          <div
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#fb923c #ffedd5',
            }}
            className="flex-1 overflow-y-auto bg-[#f9fafb] p-4 space-y-4"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 text-[14px] leading-relaxed shadow-sm transition-all ${
                    msg.role === 'user'
                      ? '!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white rounded-[18px] rounded-br-[4px]'
                      : 'bg-white text-gray-800 border border-[#f1f5f9] rounded-[18px] rounded-bl-[4px]'
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      className="mb-2 rounded-lg max-h-40 w-full object-cover"
                      alt="upload"
                    />
                  )}
                  <div
                    className="prose prose-sm prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }}
                  />
                </div>
                {/* Log Token Industrial Style */}
                {msg.role === 'model' && msg.aiInfo && (
                  <div className="mt-2 bg-slate-900 text-[9px] font-mono text-white p-2 rounded-lg w-48 shadow-lg border border-slate-700 animate-in fade-in">
                    <div className="flex justify-between border-b border-slate-700 pb-1 mb-1 opacity-70">
                      <span>Log: Status</span>
                      <span className="text-blue-400">
                        <span>
                          {msg.aiInfo?.modelUsed?.split('-').pop()?.toUpperCase() || 'AI'}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>In tokens:</span> <span>{msg.aiInfo.tokens}</span>
                    </div>
                    <div className="border-t border-slate-700 mt-1 pt-1 flex justify-between font-bold text-rose-400 uppercase">
                      <span>Total Cost:</span> <span>${Number(msg.aiInfo.cost).toFixed(6)}</span>
                    </div>
                  </div>
                )}
                <span className="text-[9px] text-gray-400 mt-1 tracking-tight">
                  {/* {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} */}
                  {formatMessageTime(msg.timestamp)}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex space-x-1.5 p-2 bg-white rounded-xl w-fit shadow-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Preview Panel (Vàng chuẩn JS cũ) */}
          {showVoicePreview && (
            <div className="mx-3 my-2 p-3 bg-[#fffbeb] border-l-4 border-[#f59e0b] rounded-lg shadow-sm animate-in slide-in-from-left-2">
              <div className="flex flex-col text-sm italic text-gray-700">
                <div className="flex items-start gap-2">
                  <Volume2 size={14} className="mt-1 text-orange-400" />
                  <span>"{voiceTranscript}"</span>
                </div>
                <div className="flex justify-end gap-3 mt-3 not-italic">
                  <Button
                    onClick={() => setShowVoicePreview(false)}
                    className="rounded-lg !bg-transparent p-2 text-gray-600 hover:!bg-gray-100"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={() => handleSend()}
                    className="flex-1 rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
                  >
                    Xác nhận & Gửi
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Image Preview Area */}
          {imagePreview && (
            <div className="px-4 py-2 bg-white flex items-center border-t border-gray-50">
              <div className="relative border-2 border-blue-100 rounded-lg p-1">
                <img src={imagePreview} className="h-14 rounded object-cover" alt="preview" />
                <Button
                  onClick={() => {
                    setImagePreview(null);
                    setSelectedImage(null);
                  }}
                  className="flex rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
                >
                  <X size={10} />
                </Button>
              </div>
            </div>
          )}

          {/* Suggestion Chips (Logic chuẩn JS cũ) */}
          <div
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="flex overflow-x-auto gap-2 px-4 py-3 bg-white border-t border-gray-100 no-scrollbar"
          >
            {smartSuggestions.map((item, i) => (
              <Button
                key={i}
                variant="ghost"
                onClick={() => handleSend(item.text)}
                className="shrink-0 flex items-center gap-2 rounded-full h-9 px-4 border border-orange-100 !bg-orange-50/50 !text-orange-700 text-[12px] font-semibold shadow-sm hover:!bg-orange-100 hover:border-orange-300 transition-all duration-200"
              >
                {/* FIX Ở ĐÂY: Kiểm tra nếu là fa- thì render thẻ i, nếu là emoji thì render chữ */}
                <span className="flex items-center justify-center text-orange-500 w-4 h-4 shrink-0">
                  {item.icon.startsWith('fa-') ? (
                    <i className={`fa-solid ${item.icon} text-[12px]`}></i>
                  ) : (
                    <span className="text-[14px]">{item.icon}</span>
                  )}
                </span>

                <span className="whitespace-nowrap">{item.text}</span>
              </Button>
            ))}
          </div>

          {/* Input Area chuẩn Messenger */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedImage(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
              className="hidden"
              accept="image/*"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex rounded-xl !bg-gradient-to-r !from-orange-400 !to-rose-400 px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
            >
              <Camera size={22} />
            </Button>
            <Button
              onClick={handleMicClick}
              className={`transition-all !bg-gradient-to-r !from-orange-400 !to-rose-400  ${
                isRecording
                  ? 'text-red-500 animate-pulse scale-125'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mic className="text-white" size={22} />
            </Button>
            <div className="flex-1 border border-orange-300 rounded-full px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500 transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nói hoặc nhập ..."
                className="bg-transparent w-full text-sm outline-none"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={() => handleSend()}
              className="!bg-gradient-to-r !from-orange-400 !to-rose-400  text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-blue-600 shadow-sm transition active:scale-90"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${
          isOpen
            ? '!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white border border-gray-200 rotate-0'
            : '!bg-gradient-to-r !from-orange-400 !to-rose-400 text-white'
        }`}
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <div className="relative">
            <MessageCircle size={28} />
            <Sparkles size={14} className="absolute -top-2 -right-2 animate-pulse" />
          </div>
        )}
      </Button>
    </div>
  );
}
