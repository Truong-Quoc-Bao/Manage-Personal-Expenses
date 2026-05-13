useEffect(() => {
  const handleBankMessage = (event: any) => {
    const { text } = event.detail; // Lấy tin nhắn ngân hàng
    
    // Đẩy tin nhắn vào danh sách của Chatbot
    setMessages((prev) => [...prev, { role: 'model', content: text }]);
    
    // Tự động mở cửa sổ chat để Bảo thấy luôn
    setIsOpen(true); 
    
    // Cập nhật lại số tiền trên màn hình (Dashboard)
    refreshDashboard(); 
  };

  // Nghe tín hiệu 'ai_add_message' phát ra từ NotificationCenter
  window.addEventListener('ai_add_message', handleBankMessage);

  return () => window.removeEventListener('ai_add_message', handleBankMessage);
}, []);