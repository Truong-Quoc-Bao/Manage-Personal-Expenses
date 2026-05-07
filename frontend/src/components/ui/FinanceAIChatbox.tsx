import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  Camera,
  Mic,
  X,
  Brain,
  SendHorizontal,
  Trophy,
  Calendar,
  PieChart,
} from 'lucide-react';
import * as React from 'react';
// IMPORT API CỦA BẢO
import { chatApi } from '../../api/ai.api';

interface Message {
  id: string | number;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

// Interface cho Model AI
interface AIModel {
  name: string;
  status: 'online' | 'offline';
}

export function FinanceAIChatbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ────────────────────────────────────────────────────────
  // BIẾN QUẢN LÝ MODEL AI
  // ────────────────────────────────────────────────────────
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('auto');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. LOAD LỊCH SỬ CHAT & DANH SÁCH MODEL (AI HEALTH)
  useEffect(() => {
    const initData = async () => {
      try {
        // Gọi song song cả lịch sử và sức khỏe AI
        const [historyRes, healthRes] = await Promise.all([
          chatApi.getChatHistory(),
          chatApi.getAiHealth(),
        ]);

        // Xử lý lịch sử
        const history = historyRes.data.map((item: any, index: number) => ({
          id: `hist-${index}`,
          role: item.role === 'user' ? 'user' : 'model',
          content: item.message,
          timestamp: new Date(),
        }));
        if (history.length > 0) setMessages(history);
        else
          setMessages([
            {
              id: 'welcome',
              role: 'model',
              content: 'Chào Bảo! Money Guard đây...',
              timestamp: new Date(),
            },
          ]);

        // Xử lý danh sách Model từ server
        setAvailableModels(healthRes.data || []);
      } catch (err) {
        console.error('Lỗi khởi tạo dữ liệu:', err);
      }
    };

    initData();

    // Thiết lập interval quét sức khỏe AI 30s một lần giống code mẫu của Bảo
    const interval = setInterval(async () => {
      try {
        const healthRes = await chatApi.getAiHealth();
        setAvailableModels(healthRes.data || []);
      } catch (e) {
        console.log('Lỗi đồng bộ AI');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 2. HÀM GỬI TIN NHẮN (Gửi kèm model đã chọn)
  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      // GỬI KÈM MODEL TRONG DATA (Theo đúng interface sendMessage trong file api của Bảo)
      const res = await chatApi.sendMessage({
        message: textToSend,
        model: selectedModel, // <--- Lấy giá trị từ select dropdown
      });

      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'model',
        content: res.data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: any) {
      setError('AI đang bận một chút, Bảo thử lại sau nhé!');
    } finally {
      setIsTyping(false);
    }
  };

  // Hàm rút gọn tên model cho đẹp UI (Ví dụ: gemini-1.5-flash-latest -> FLASH)
  const formatModelName = (name: string) => {
    return name
      .replace('gemini-', '')
      .replace('-latest', '')
      .replace('-preview', '')
      .replace('1.5-', '')
      .toUpperCase();
  };

  const suggestions = [
    {
      text: 'Thử thách 7 ngày không trà sữa',
      icon: <Trophy size={14} className="text-blue-500" />,
    },
    {
      text: 'Thứ mấy tôi tiêu nhiều nhất?',
      icon: <Calendar size={14} className="text-blue-500" />,
    },
  ];

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[700px] w-full max-w-[450px] relative font-sans mx-auto">
      {/* Header */}
      <div className="bg-[#0084ff] p-4 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base leading-tight">Money Guard AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/80 text-[10px] font-medium uppercase tracking-wider">
                AI Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ──────────────────────────────────────────────────────── */}
          {/* MODEL SELECTOR - ĐÃ NHÉT LOGIC API VÀO ĐÂY */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/20 transition-all cursor-pointer">
            <Brain size={12} className="text-white mr-1.5" />
            <select
              id="model-selector"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-white text-[11px] font-bold outline-none cursor-pointer appearance-none uppercase max-w-[80px] text-center"
            >
              <option value="auto" className="text-gray-900">
                🤖 AUTO
              </option>
              {availableModels.map((m) => (
                <option
                  key={m.name}
                  value={m.name}
                  disabled={m.status !== 'online'}
                  className="text-gray-900"
                >
                  {m.status === 'online' ? '●' : '○'} {formatModelName(m.name)}
                </option>
              ))}
            </select>
          </div>

          <button className="p-1.5 text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f9fafb]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {message.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-auto">
                <Bot className="w-5 h-5 text-[#0084ff]" />
              </div>
            )}
            <div
              className={`flex flex-col ${
                message.role === 'user' ? 'items-end' : 'items-start'
              } max-w-[85%]`}
            >
              <div
                className={`px-4 py-2.5 shadow-sm text-sm ${
                  message.role === 'user'
                    ? 'bg-[#0084ff] text-white rounded-[1.2rem] rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-[1.2rem] rounded-tl-none font-medium'
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2.5 items-end">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-[#0084ff]" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 py-2 bg-[#f9fafb] border-t border-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(item.text)}
            className="flex items-center gap-2 whitespace-nowrap px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:bg-blue-50 transition-all shadow-sm shrink-0"
          >
            {item.icon} {item.text}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-blue-500">
            <Camera size={22} />
          </button>
          <button className="p-2 text-gray-400 hover:text-red-500">
            <Mic size={22} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Nói hoặc nhập ..."
            className="flex-1 bg-gray-100 border-none rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
            disabled={isTyping}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className={`p-2.5 bg-[#0084ff] text-white rounded-full transition-all shadow-md ${
              !inputValue.trim() || isTyping ? 'opacity-40' : 'hover:bg-blue-600'
            }`}
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
