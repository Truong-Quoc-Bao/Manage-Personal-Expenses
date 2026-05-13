// --- BƯỚC FIX: LẮNG NGHE THÔNG BÁO NGÂN HÀNG ĐỂ TỰ ĐỘNG HIỆN TIN NHẮN ---
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