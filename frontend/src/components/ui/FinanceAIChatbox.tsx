import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import * as React from "react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function FinanceAIChatbox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Xin chào! Tôi là trợ lý tài chính AI. Tôi có thể giúp bạn phân tích chi tiêu, đưa ra lời khuyên tiết kiệm và trả lời các câu hỏi về tài chính cá nhân. Bạn muốn tôi giúp gì?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Phân tích chi tiêu
    if (
      lowerMessage.includes("chi tiêu") ||
      lowerMessage.includes("tiêu") ||
      lowerMessage.includes("phân tích")
    ) {
      return "Dựa trên dữ liệu của bạn, tôi thấy chi tiêu tháng này là 8.5 triệu đồng. Danh mục chi tiêu lớn nhất là Ăn uống (3.5 triệu - 41%). Tôi khuyên bạn nên:\n\n• Giảm chi tiêu ăn uống 10-15% bằng cách nấu ăn tại nhà nhiều hơn\n• Đặt ngân sách cố định cho mỗi danh mục\n• Theo dõi chi tiêu hàng ngày để kiểm soát tốt hơn";
    }

    // Tiết kiệm
    if (lowerMessage.includes("tiết kiệm") || lowerMessage.includes("tiền")) {
      return "Để tăng khả năng tiết kiệm, tôi đề xuất:\n\n• Áp dụng quy tắc 50/30/20: 50% cho nhu cầu thiết yếu, 30% cho mong muốn, 20% cho tiết kiệm\n• Thiết lập tài khoản tiết kiệm riêng\n• Tự động chuyển 15-20% thu nhập vào tiết kiệm ngay khi nhận lương\n• Giảm chi tiêu không cần thiết như cafe, giải trí";
    }

    // Thu nhập
    if (lowerMessage.includes("thu nhập") || lowerMessage.includes("lương")) {
      return "Thu nhập của bạn tháng này là 15 triệu đồng, với tỷ lệ tiết kiệm là 43.3% - rất tốt! Để tối ưu hóa thu nhập:\n\n• Tìm kiếm nguồn thu nhập phụ (freelance, đầu tư)\n• Nâng cao kỹ năng để tăng thu nhập chính\n• Đầu tư vào tài sản sinh lời như cổ phiếu, quỹ đầu tư";
    }

    // Mục tiêu tài chính
    if (
      lowerMessage.includes("mục tiêu") ||
      lowerMessage.includes("kế hoạch")
    ) {
      return "Để đạt được mục tiêu tài chính:\n\n• Xác định rõ mục tiêu ngắn hạn và dài hạn\n• Tính toán số tiền cần tiết kiệm mỗi tháng\n• Tạo quỹ khẩn cấp bằng 3-6 tháng chi tiêu\n• Đầu tư có kế hoạch cho tương lai\n• Xem xét bảo hiểm để bảo vệ tài chính";
    }

    // Danh mục chi tiêu
    if (lowerMessage.includes("ăn uống") || lowerMessage.includes("đồ ăn")) {
      return "Chi tiêu ăn uống của bạn là 3.5 triệu/tháng (41% tổng chi). Đây hơi cao so với mức khuyến nghị (25-30%). Gợi ý:\n\n• Nấu ăn tại nhà 4-5 bữa/tuần\n• Đặt giới hạn 100-150k cho mỗi bữa ăn ngoài\n• Mua sắm thực phẩm theo danh sách\n• Tận dụng ưu đãi và combo";
    }

    if (lowerMessage.includes("di chuyển") || lowerMessage.includes("xăng")) {
      return "Chi phí di chuyển của bạn là 1.2 triệu/tháng (14% tổng chi). Mức này khá hợp lý. Để tiết kiệm thêm:\n\n• Sử dụng phương tiện công cộng khi có thể\n• Gộp các chuyến đi để tiết kiệm xăng\n• Cân nhắc dịch vụ xe công nghệ thay vì xe cá nhân cho một số chuyến";
    }

    // Lời khuyên chung
    if (lowerMessage.includes("lời khuyên") || lowerMessage.includes("gợi ý")) {
      return "Dựa trên tình hình tài chính của bạn, tôi có một số lời khuyên:\n\n• Tình hình tài chính của bạn khá tốt với tỷ lệ tiết kiệm cao\n• Tập trung vào việc duy trì thói quen chi tiêu hiện tại\n• Tìm hiểu về đầu tư để tăng giá trị tài sản\n• Xây dựng quỹ dự phòng ít nhất 6 tháng chi tiêu\n• Đa dạng hóa nguồn thu nhập";
    }

    // Câu hỏi về app
    if (
      lowerMessage.includes("sử dụng") ||
      lowerMessage.includes("app") ||
      lowerMessage.includes("ứng dụng")
    ) {
      return "Để sử dụng ứng dụng hiệu quả:\n\n• Cập nhật giao dịch đều đặn mỗi ngày\n• Phân loại chi tiêu đúng danh mục\n• Xem báo cáo thống kê hàng tuần\n• Đặt ngân sách cho từng danh mục\n• Theo dõi xu hướng chi tiêu theo tháng";
    }

    // Default response
    const defaultResponses = [
      "Đó là một câu hỏi hay! Dựa trên dữ liệu của bạn, tôi khuyên bạn nên theo dõi chi tiêu thường xuyên và đặt mục tiêu tiết kiệm rõ ràng.",
      "Tôi hiểu mối quan tâm của bạn. Hãy xem phần thống kê chi tiết để có cái nhìn tổng quan về tài chính của bạn.",
      "Câu hỏi thú vị! Tôi có thể giúp bạn phân tích chi tiêu theo danh mục hoặc đưa ra lời khuyên về tiết kiệm. Bạn muốn biết điều gì cụ thể?",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-rose-400 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white text-lg">Trợ lý tài chính AI</h3>
          <p className="text-white/80 text-sm">Luôn sẵn sàng hỗ trợ bạn</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === "user"
                  ? "bg-gradient-to-br from-orange-400 to-rose-400"
                  : "bg-gradient-to-br from-purple-400 to-pink-400"
              }`}
            >
              {message.role === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={`flex-1 ${
                message.role === "user" ? "flex flex-col items-end" : ""
              }`}
            >
              <div
                className={`inline-block max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1 px-2">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Hỏi tôi về tài chính của bạn..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl hover:from-orange-500 hover:to-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setInputValue("Phân tích chi tiêu của tôi")}
            className="rounded-full !bg-gray-100 px-3 py-1 text-xs text-gray-700 transition hover:!bg-gray-200"
          >
            💡 Phân tích chi tiêu
          </button>

          <button
            type="button"
            onClick={() => setInputValue("Làm sao để tiết kiệm hơn?")}
            className="rounded-full !bg-gray-100 px-3 py-1 text-xs text-gray-700 transition hover:!bg-gray-200"
          >
            💰 Lời khuyên tiết kiệm
          </button>

          <button
            type="button"
            onClick={() => setInputValue("Đưa ra mục tiêu tài chính")}
            className="rounded-full !bg-gray-100 px-3 py-1 text-xs text-gray-700 transition hover:!bg-gray-200"
          >
            🎯 Mục tiêu tài chính
          </button>
        </div>
      </div>
    </div>
  );
}
