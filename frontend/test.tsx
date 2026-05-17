const handleMessage = async (event: MessageEvent) => {
  console.log('📨 postMessage nhận được:', event.data);

  if (
    event.data?.event === 'FINISHED_BANK_ACCOUNT_LINK'
  ) {
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