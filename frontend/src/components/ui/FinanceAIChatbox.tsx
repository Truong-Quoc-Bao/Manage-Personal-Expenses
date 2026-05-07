import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import * as React from 'react';
// IMPORT API CỦA BẢO VÀO ĐÂY
import { chatApi, statsApi, notificationApi, bankApi } from '../../api/ai.api';

interface Message {
  id: string | number;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export function FinanceAIChatbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. LOAD LỊCH SỬ CHAT KHI MỞ TRANG
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await chatApi.getChatHistory();
        // Giả sử BE trả về mảng [{role: 'user', message: '...'}, ...]
        const history = res.data.map((item: any, index: number) => ({
          id: `hist-${index}`,
          role: item.role,
          content: item.message,
          timestamp: new Date(), // BE của Bảo có created_at thì dùng ở đây
        }));

        if (history.length > 0) {
          setMessages(history);
        } else {
          // Nếu chưa có lịch sử, hiện lời chào mặc định
          setMessages([
            {
              id: 'welcome',
              role: 'model',
              content: 'Chào Bảo! Tôi là Money Guard. Tôi đã sẵn sàng soi ví giúp bạn rồi đây!',
              timestamp: new Date(),
            },
          ]);
        }
      } catch (err) {
        console.error('Lỗi load lịch sử:', err);
        setError('Không thể tải lịch sử trò chuyện.');
      }
    };

    loadHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 2. HÀM GỬI TIN NHẮN THẬT LÊN SERVER
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      // GỌI API THẬT
      const res = await chatApi.sendMessage({ message: userText });

      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'model',
        content: res.data.reply, // BE của Bảo trả về { reply: "..." }
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: any) {
      console.error('Lỗi gửi tin nhắn:', err);
      setError('AI đang bận một chút, Bảo thử lại sau nhé!');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[600px] relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-4 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">Money Guard AI</h3>
          <p className="text-white/80 text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Hệ thống đang trực tuyến
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 text-red-600 p-2 text-xs flex items-center justify-center gap-2 border-b border-red-100">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-orange-400 to-rose-400'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-rose-500" />
              )}
            </div>
            <div
              className={`flex flex-col ${
                message.role === 'user' ? 'items-end' : 'items-start'
              } max-w-[85%]`}
            >
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
              </div>
              <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Animation */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <Bot className="w-5 h-5 text-rose-500" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-4 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Hỏi Money Guard về chi tiêu..."
            className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="p-2.5 bg-orange-500 text-white rounded-xl hover:bg-rose-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['Phân tích chi tiêu', 'Lương tháng này', 'Tôi đã tiêu gì?'].map((text) => (
            <button
              key={text}
              onClick={() => setInputValue(text)}
              className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-all shadow-sm"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
