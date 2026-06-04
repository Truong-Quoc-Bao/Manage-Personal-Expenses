const handleMessage = async (event: MessageEvent) => {
  console.log('📨 postMessage nhận được:', event.data);

  if (event.data?.event === 'FINISHED_BANK_ACCOUNT_LINK') {
    window.removeEventListener('message', handleMessage);
    clearInterval(checkClosed);
    popup?.close();

    // ✅ Lấy từ metadata, không phải root
    const { account_number, account_type, bank_name } = event.data.metadata;
    console.log('🏦 Data từ SePay:', { account_number, account_type, bank_name });

    try {
      await bankApi.saveBankAccount({ account_number, account_type, bank_name });
      toast.success('Liên kết ngân hàng thành công!');
      fetchAccounts();
    } catch (err) {
      console.error('Lỗi lưu tài khoản:', err);
      toast.error('Liên kết thành công nhưng lưu thất bại');
    } finally {
      setIsLinkingBank(false);
    }
  }
};

// --- 1.2 LẮNG NGHE TIN NHẮN TỪ NGÂN HÀNG ---
useEffect(() => {
  const handleBankMessage = (event: any) => {
    const { text, isUser } = event.detail;

    console.log('📨 FloatingChat nhận được tin nhắn từ hệ thống:', text);

    // 🔥 CHỐT CHẶN CHỐNG TRÙNG (Giống FinanceAIChatbox)
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

    // Tự động mở cửa sổ chat nếu đang đóng
    if (!isOpen) {
      setIsOpen(true);
    }

    playNotificationSound();
    refreshDashboard();
  };

  window.addEventListener('ai_add_message', handleBankMessage);
  return () => {
    window.removeEventListener('ai_add_message', handleBankMessage);
  };
}, [isOpen]);

// Tìm đoạn này trong Dashboard.tsx
useEffect(() => {
  const handleSync = () => {
    console.log('📊 Dashboard: Nhận lệnh đồng bộ');

    // SỬA Ở ĐÂY: Đợi 500ms (0.5 giây) để Backend kịp tính toán xong số liệu mới
    setTimeout(() => {
      loadAllData();
    }, 500);

    toast.info('Dữ liệu tài chính đã được cập nhật!');
  };

  window.addEventListener('money-guard-sync', handleSync);
  window.addEventListener('dashboard_refresh', handleSync);
  return () => {
    window.removeEventListener('money-guard-sync', handleSync);
    window.removeEventListener('dashboard_refresh', handleSync);
  };
}, [loadAllData]);


balance: Joi.number()
      .min(0) // Thay .greater(0) thành .min(0)
      .messages({
        "number.base": "balance must be a number",
        "number.min": "balance must be at least 0", // Cập nhật lại thông báo lỗi nếu cần
        "any.required": "balance is required",
      })
      .optional(),

      balance: Joi.number()
      .min(0) 
      .default(0) // THÊM DÒNG NÀY: Nếu không gửi hoặc gửi 0, nó sẽ tự nhận là 0
      .messages({
        'number.base': 'balance must be a number',
        'number.min': 'balance must be at least 0',
        'any.required': 'balance is required',
      })
      .optional()
      .allow(0), // THÊM DÒNG NÀY: Ép Joi phải chấp nhận số 0


      balance: Joi.number()
  .min(0)
  .allow(0) // Chấp nhận số 0
  .required() // Nếu bạn muốn bắt buộc phải gửi (dù là gửi số 0)
  .messages({
    'number.base': 'balance must be a number',
    'number.min': 'balance must be at least 0',
    'any.required': 'balance is required',
  }),

      // Kiểm tra xem nó có thực sự bị undefined (không gửi) hay không
if (balance === undefined || balance === null) {
  return res.status(400).json({ message: "balance is required" });
}



const handleSend = async (textOverride?: string) => {
  const message = textOverride || inputValue.trim();
  // ... (giữ nguyên code cũ)

  setMessages((prev) => [...prev, userMsg]);

  // RESET THÊM 2 DÒNG NÀY Ở ĐÂY
  setVoiceTranscript(''); // Xóa chữ thu âm cũ
  setShowVoicePreview(false); // Ẩn khung màu vàng

  // ... (đoạn try/catch gọi API giữ nguyên)
};

const message = textOverride || voiceTranscript || inputValue.trim();


rec.onresult = (event: any) => {
  let final = '';
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    final += event.results[i][0].transcript;
  }
  setVoiceTranscript(final);
  setInputValue(final); // <-- THÊM DÒNG NÀY: Chữ sẽ nhảy vào ô input ngay lập tức
};