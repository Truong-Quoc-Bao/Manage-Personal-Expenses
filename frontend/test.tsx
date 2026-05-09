// --- 1.2 LẮNG NGHE TIN NHẮN TỪ NGÂN HÀNG (Dán dưới useEffect âm thanh) ---
useEffect(() => {
  const handleBankMessage = (event: any) => {
    const { text, isUser } = event.detail;

    console.log('📨 FloatingChat nhận được tin nhắn từ hệ thống:', text);

    // Thêm tin nhắn mới vào danh sách hiện tại
    setMessages((prev) => [
      ...prev,
      {
        role: isUser ? 'user' : 'model',
        content: text,
      },
    ]);

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
