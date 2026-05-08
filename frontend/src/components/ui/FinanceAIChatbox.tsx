import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  Loader2,
  Zap,
  Camera,
  Mic,
  Volume2,
  X,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { marked } from 'marked';
// IMPORT API CỦA BẢO
import { chatApi, statsApi } from '../../api/ai.api';

// --- Interfaces ---
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
  // --- States ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  // --- 1. KHỞI TẠO ÂM THANH & TƯƠNG TÁC ---
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

  // --- 2. ĐỒNG BỘ DATA & AI HEALTH (30s/lần) ---
  useEffect(() => {
    initChatData();
    const interval = setInterval(syncAIModels, 30000);
    return () => clearInterval(interval);
  }, []);

  const initChatData = async () => {
    try {
      const [histRes, statsRes] = await Promise.all([
        chatApi.getChatHistory(),
        statsApi.getStats(),
      ]);

      const history = histRes.data.map((m: any, idx: number) => ({
        id: `hist-${idx}`,
        role: m.role === 'user' ? 'user' : 'model',
        content: m.message.replace(/<.*?>[\s\S]*?<\/.*?>/gs, '').trim(),
        timestamp: new Date(),
      }));

      setMessages(
        history.length > 0
          ? history
          : [
              {
                id: 'welcome',
                role: 'model',
                content: 'Chào Bảo! Tôi là Money Guard. Bạn cần soi ví hay ghi sổ món gì không?',
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

  // --- 3. SPEECH RECOGNITION (Chuẩn JS) ---
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

  // --- 4. GỬI TIN NHẮN & XỬ LÝ TEXT-TO-SPEECH ---
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

      // Speak & Sound
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
          content: 'AI đang bận, Bảo thử lại sau nhé!',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 5. SMART SUGGESTIONS ---
  const suggestions = useMemo(() => {
    if (!stats) return ['Ăn sáng 30k', 'Hôm nay tiêu gì?', 'Ví còn bao nhiêu?'];
    const sug = [];
    const balance = stats.income - stats.expense;
    if (balance < 0) sug.push('☠️ Kế hoạch trả nợ', '⚠️ Cắt giảm chi tiêu');
    else sug.push('💰 Tôi còn bao nhiêu?', '💸 Ghi sổ cafe 25k');
    sug.push('📊 So sánh tuần trước');
    return sug.slice(0, 4);
  }, [stats]);

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-2xl overflow-hidden font-sans border border-gray-100">
      {/* Header - Industrial & Pro */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-700 to-indigo-800 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
            <Brain className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest">
              Money Guard Engine
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-[10px] text-white/90 font-bold outline-none cursor-pointer uppercase appearance-none"
              >
                <option value="auto" className="text-black">
                  🤖 Auto Brain
                </option>
                {aiModels.map((m) => (
                  <option
                    key={m.name}
                    value={m.name}
                    className="text-black"
                    disabled={m.status !== 'online'}
                  >
                    {m.status === 'online' ? '●' : '○'} {m.name.split('-').pop()?.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <Zap className="w-5 h-5 text-yellow-400" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
                msg.role === 'user' ? 'bg-blue-600 border-blue-500' : 'bg-white border-gray-200'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-indigo-600" />
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
                    ? 'bg-blue-600 text-white rounded-tr-none'
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

              {/* Token Usage Log (Black Panel) */}
              {msg.role === 'model' && msg.aiInfo && (
                <div className="mt-2 bg-slate-900 text-[9px] font-mono text-white p-2 rounded-lg w-48 border border-slate-700">
                  <div className="flex justify-between border-b border-slate-700 pb-1 mb-1 opacity-70">
                    <span>LOG_STATUS</span>
                    <span className="text-blue-400 font-bold uppercase">
                      {msg.aiInfo.modelUsed.split('-').pop()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Input Tokens:</span> <span>{msg.aiInfo.tokens}</span>
                  </div>
                  <div className="border-t border-slate-700 mt-1 pt-1 flex justify-between font-bold text-rose-400 uppercase">
                    <span>Est. Cost:</span> <span>${Number(msg.aiInfo.cost).toFixed(6)}</span>
                  </div>
                </div>
              )}
              <span className="text-[9px] text-gray-400 mt-1 uppercase tracking-tighter">
                {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex space-x-1.5 ml-14">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Preview Panel (Yellow) */}
      {showVoicePreview && (
        <div className="mx-6 my-2 p-3 bg-[#fffbeb] border-l-4 border-[#f59e0b] rounded-lg shadow-sm animate-in slide-in-from-left-2">
          <div className="flex flex-col text-sm italic text-gray-700">
            <div className="flex items-start gap-2 text-blue-900 font-medium">
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
                className="text-[10px] font-bold text-blue-600 uppercase underline decoration-2"
              >
                Xác nhận & Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        {/* Suggestion Chips */}
        <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {suggestions.map((txt) => (
            <button
              key={txt}
              onClick={() =>
                handleSend(
                  txt.replace(
                    /[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi,
                    '',
                  ),
                )
              }
              className="whitespace-nowrap px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-[11px] font-bold text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all"
            >
              {txt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl border border-gray-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
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
            className="p-2 text-gray-400 hover:text-blue-600"
          >
            <Camera size={22} />
          </button>
          <button
            onClick={() =>
              isRecording ? recognitionRef.current?.stop() : recognitionRef.current?.start()
            }
            className={`p-2 transition-all ${
              isRecording ? 'text-red-500 animate-pulse scale-110' : 'text-gray-400'
            }`}
          >
            <Mic size={22} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nói hoặc nhập chi tiêu..."
            className="flex-1 bg-transparent px-2 text-sm outline-none"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 disabled:opacity-20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
