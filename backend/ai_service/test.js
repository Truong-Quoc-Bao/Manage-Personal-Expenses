import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Robot,
  Brain,
  Send,
  Camera,
  Mic,
  X,
  Trash2,
  SendHorizontal,
  Image as ImageIcon,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'; // Sử dụng Lucide thay cho FontAwesome

export default function MoneyGuardChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [imagePreview, setImagePreview] = useState(null);
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Giả lập danh sách tin nhắn
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      content: 'Chào Bảo! Money Guard đây, hôm nay Bảo muốn ghi sổ món gì nào?',
    },
  ]);

  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      {/* 1. Floating Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#0084ff] rounded-full shadow-xl flex items-center justify-center text-white hover:bg-blue-600 transition-all transform hover:scale-105 z-50"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* 2. Chat Widget Container */}
      <div
        className={`fixed bottom-24 right-6 w-[380px] max-w-[90vw] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 transition-all duration-300 transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* --- Header --- */}
        <div className="bg-[#0084ff] p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
              <div className="text-white">
                <Robot size={20} />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">Money Guard AI</h2>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-white/70 font-medium">AI Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Model Selector */}
            <div className="flex items-center bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full border border-white/20 transition-all">
              <Brain size={10} className="mr-1 opacity-70" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-white text-[9px] font-black outline-none cursor-pointer uppercase appearance-none"
              >
                <option value="auto" className="text-gray-900">
                  🤖 AUTO
                </option>
                <option value="flash" className="text-gray-900">
                  ⚡ FLASH
                </option>
                <option value="pro" className="text-gray-900">
                  🔥 PRO
                </option>
              </select>
            </div>

            <a href="#" className="text-white hover:text-blue-200 transition">
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        {/* --- Messages Area --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#0084ff] text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* --- Image Preview (Hiển thị khi chọn ảnh) --- */}
        {imagePreview && (
          <div className="px-4 pt-2 pb-0 bg-white shrink-0 relative">
            <div className="relative inline-block border border-gray-200 rounded-lg p-1">
              <img src={imagePreview} alt="preview" className="h-16 rounded object-cover" />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* --- Suggestions Bar --- */}
        <div className="flex overflow-x-auto space-x-2 px-3 py-2 bg-white border-t border-gray-50 no-scrollbar">
          {['Phân tích chi tiêu', 'Ghi sổ 50k cafe', 'Báo cáo tháng'].map((text, idx) => (
            <button
              key={idx}
              onClick={() => setInputValue(text)}
              className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-100 rounded-full text-[11px] font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm shrink-0"
            >
              {text}
            </button>
          ))}
        </div>

        {/* --- Voice Preview Panel (Hiển thị khi đang nói) --- */}
        {isRecording && (
          <div className="mx-3 my-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-start space-x-2">
                <span className="text-sm text-gray-700 font-medium italic leading-tight">
                  {voiceText || 'Money Guard đang nghe...'}
                </span>
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setIsRecording(false)}
                  className="text-[10px] font-bold text-gray-500 uppercase tracking-wider"
                >
                  Hủy
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- Input Form --- */}
        <form className="flex items-center p-3 bg-white border-t border-gray-100 shrink-0">
          <button type="button" className="text-gray-400 hover:text-[#0084ff] px-2">
            <Camera size={20} />
          </button>
          <button
            type="button"
            onClick={() => setIsRecording(true)}
            className={`px-2 transition-all ${
              isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Mic size={20} />
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nói hoặc nhập ..."
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 mx-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-[#0084ff] text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-blue-600 transition shadow-sm disabled:opacity-50"
          >
            <SendHorizontal size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
