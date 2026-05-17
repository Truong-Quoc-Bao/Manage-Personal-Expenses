import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  Camera,
  Mic,
  Volume2,
  X,
  ChevronDown,
  Cpu,
} from 'lucide-react';
import { marked } from 'marked';
import { chatApi, statsApi } from '../../api/ai.api';
import { formatMessageTime } from '../../utils/format';

interface Message {
  id: string | number;
  role: 'user' | 'model';
  content: string;
  image?: string;
  timestamp: Date;
  aiInfo?: {
    modelUsed: string;
    tokens: number;
    cost: number;
    usage?: any;
  };
}

interface AIModel {
  name: string;
  status: 'online' | 'offline';
}

export function FinanceAIChatbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showVoicePreview, setShowVoicePreview] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);
  const modelPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    audioRef.current = new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
    );
    audioRef.current.volume = 0.5;

    const handler = () => {
      hasInteractedRef.current = true;
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    initChatData();
    const interval = setInterval(syncAIModels, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setShowModelPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  //
  useEffect(() => {
    const handleSync = () => {
      console.log('🤖 AI Chatbox: Đồng bộ stats mới...');
      initChatData(); // Hàm này của bạn đã có sẵn ở dòng 90
    };

    window.addEventListener('money-guard-sync', handleSync);
    return () => window.removeEventListener('money-guard-sync', handleSync);
  }, []);

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

  //LẮNG NGHE THÔNG BÁO NGÂN HÀNG ĐỂ TỰ ĐỘNG HIỆN TIN NHẮN ---
  useEffect(() => {
    const handleBankMessage = (event: any) => {
      const { text, isUser } = event.detail;

      console.log('🤖 Chatbox tập trung nhận được tin nhắn hệ thống:', text);

      // 1. Thêm tin nhắn mới vào danh sách
      setMessages((prev) => {
        // Chốt chặn chống trùng tin nhắn trong 1 giây
        if (prev.length > 0 && prev[prev.length - 1].content === text) {
          return prev;
        }

        return [
          ...prev,
          {
            id: Date.now(),
            role: isUser ? 'user' : 'model',
            content: text,
            timestamp: new Date(),
          },
        ];
      });

      // 2. Phát âm thanh "Ting Ting"
      if (hasInteractedRef.current) {
        audioRef.current?.play().catch(() => {});
      }

      // 3. Tự động load lại số liệu (Stats) để Dashboard cập nhật số tiền mới
      initChatData();
    };

    // Đăng ký nghe sự kiện 'ai_add_message' phát ra từ NotificationCenter
    window.addEventListener('ai_add_message', handleBankMessage);

    return () => {
      // Hủy nghe khi Bảo chuyển trang khác
      window.removeEventListener('ai_add_message', handleBankMessage);
    };
  }, []); // [] để chỉ chạy 1 lần khi mở trang

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, showVoicePreview]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'vi-VN';
      rec.interimResults = true;
      rec.onstart = () => {
        setIsRecording(true);
        setShowVoicePreview(true);
        setVoiceTranscript('Đang nghe...');
      };
      rec.onresult = (e: any) => {
        setVoiceTranscript(
          Array.from(e.results)
            .map((r: any) => r[0].transcript)
            .join(''),
        );
      };
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
    }
  }, []);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || (showVoicePreview ? voiceTranscript : inputValue).trim();
    if ((!text && !selectedImage) || isLoading) return;

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
      image: imagePreview || undefined,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setInputValue('');
    setSelectedImage(null);
    setImagePreview(null);
    setShowVoicePreview(false);
    setIsLoading(true);

    try {
      const res = await chatApi.sendMessage({
        message: text,
        model: selectedModel,
        image: selectedImage || undefined,
      });
      const cleanReply = res.data.reply.replace(/<.*?>[\s\S]*?<\/.*?>/gs, '').trim();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'model',
          content: cleanReply,
          timestamp: new Date(),
          aiInfo: {
            modelUsed: res.data.modelUsed,
            tokens: res.data.usage?.totalTokenCount || 0,
            cost: res.data.cost,
          },
        },
      ]);

      if (hasInteractedRef.current) audioRef.current?.play().catch(() => {});
      const utterance = new SpeechSynthesisUtterance(
        cleanReply.replace(/<.*?>/g, '').substring(0, 300),
      );
      utterance.lang = 'vi-VN';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'model',
          content: 'AI đang bận, bạn thử lại sau nhé!',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // HỆ THỐNG GỢI Ý SIÊU CẤP (Bản fix lỗi biến và logic) ---
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

  const onlineCount = aiModels.filter((m) => m.status === 'online').length;
  const selectedModelLabel =
    selectedModel === 'auto'
      ? 'Auto'
      : selectedModel.split('-').pop()?.toUpperCase() || selectedModel;

  return (
    <div className="flex flex-col h-[650px] rounded-2xl overflow-hidden font-sans border border-gray-100 shadow-lg bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-rose-400 p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm tracking-wide">Money Guard</h3>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-white/70">
                {onlineCount > 0 ? `${onlineCount} model online` : 'Đang kết nối...'}
              </p>
            </div>
          </div>

          {/* Model Picker Button */}
          <div className="relative" ref={modelPickerRef}>
            <button
              type="button"
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/25 rounded-lg px-2.5 py-1.5 transition-all"
            >
              <Cpu className="w-3.5 h-3.5 text-white" />
              <span className="text-[11px] font-semibold text-white">{selectedModelLabel}</span>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </button>

            {showModelPicker && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel('auto');
                    setShowModelPicker(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-orange-50 ${
                    selectedModel === 'auto'
                      ? 'bg-orange-50 text-orange-600 font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <div>
                    <p className="text-sm font-medium">Auto</p>
                    <p className="text-[10px] text-gray-400">Tự chọn model tốt nhất</p>
                  </div>
                </button>
                {aiModels.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    disabled={m.status !== 'online'}
                    onClick={() => {
                      setSelectedModel(m.name);
                      setShowModelPicker(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                      m.status !== 'online' ? 'opacity-40 cursor-not-allowed' : 'hover:bg-orange-50'
                    } ${
                      selectedModel === m.name
                        ? 'bg-orange-50 text-orange-600 font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        m.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {m.name.split('-').pop()?.toUpperCase()}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {m.status === 'online' ? 'Sẵn sàng' : 'Offline'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-orange-50/30 to-white scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-orange-400 to-rose-400 border-orange-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-orange-500" />
              )}
            </div>
            <div
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              } max-w-[80%]`}
            >
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    className="mb-2 rounded-lg max-h-60 w-full object-cover"
                    alt="upload"
                  />
                )}
                <div
                  className="prose prose-sm prose-slate max-w-none break-words"
                  dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }}
                />
              </div>

              {msg.role === 'model' && msg.aiInfo && (
                <div className="mt-2 bg-gray-900 text-[9px] font-mono text-white p-2 rounded-lg w-48 border border-gray-700">
                  <div className="flex justify-between border-b border-gray-700 pb-1 mb-1 opacity-70">
                    <span>MODEL</span>
                    <span className="text-orange-400 font-bold uppercase">
                      {msg.aiInfo?.modelUsed?.split('-')?.pop() || 'AI'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tokens:</span> <span>{msg.aiInfo.tokens}</span>
                  </div>
                  <div className="border-t border-gray-700 mt-1 pt-1 flex justify-between font-bold text-rose-400 uppercase">
                    <span>Cost:</span> <span>${Number(msg.aiInfo.cost).toFixed(6)}</span>
                  </div>
                </div>
              )}
              <span className="text-[9px] text-gray-400 mt-1 tracking-tight">
                {/* {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} */}
                {formatMessageTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex space-x-1.5 ml-14">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Preview */}
      {showVoicePreview && (
        <div className="mx-6 my-2 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-lg shadow-sm">
          <div className="flex flex-col text-sm italic text-gray-700">
            <div className="flex items-start gap-2 text-gray-800 font-medium">
              <Volume2 size={16} className="mt-1 text-orange-400" />
              <span>"{voiceTranscript}"</span>
            </div>
            <div className="flex justify-end gap-3 mt-3 not-italic">
              <button
                onClick={() => setShowVoicePreview(false)}
                className="text-[10px] font-bold text-gray-400 uppercase hover:text-red-500"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSend()}
                className="text-[10px] font-bold text-orange-600 uppercase underline decoration-2"
              >
                Xác nhận & Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 bg-white border-t border-gray-100">
        {/* Suggestion Chips */}
        <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-hide py-1">
          {smartSuggestions.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSend(item.text)}
              className="flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2 bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-200/80 rounded-full text-[11px] font-bold text-orange-600 hover:from-orange-400 hover:to-rose-400 hover:text-white hover:border-transparent hover:shadow-md transition-all active:scale-95"
            >
              <span className="flex items-center justify-center shrink-0">
                {item.icon.startsWith('fa-') ? (
                  // Chỉnh text-[13px] cho icon FA để nó cân đối với chữ 11px
                  // Thêm transform translate-y để tinh chỉnh vị trí theo pixel nếu cần
                  <i
                    className={`fa-solid ${item.icon} text-[13px] transform translate-y-[0.5px]`}
                  ></i>
                ) : (
                  // Nếu là emoji, để to hơn 1 tí nhìn cho rõ
                  <span className="text-[14px] leading-none">{item.icon}</span>
                )}
              </span>

              {/* Text: Dùng leading-none để xóa khoảng trắng thừa của dòng */}
              <span className="leading-none pt-[1px]">{item.text}</span>
            </button>
          ))}
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img
              src={imagePreview}
              className="h-16 rounded-lg border border-gray-200"
              alt="preview"
            />
            <button
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-2xl border border-gray-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 focus-within:border-orange-300 transition-all">
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
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg !bg-gradient-to-r !from-orange-400 !to-rose-400  hover:bg-orange-50 hover:text-orange-600 transition-all"
          >
            <Camera size={20} />
          </button>
          <button
            onClick={() =>
              isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()
            }
            className={`p-2 !bg-gradient-to-r !from-orange-400 !to-rose-400 rounded-lg transition-all ${
              isRecording
                ? 'text-red-500 animate-pulse scale-125'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Mic size={20} className="text-white" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nói hoặc nhập chi tiêu..."
            className="flex-1 bg-transparent px-2 text-sm outline-none text-gray-800 placeholder:text-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading}
            className="p-2.5 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl hover:from-orange-500 hover:to-rose-500 shadow-md transition-all active:scale-95 disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
