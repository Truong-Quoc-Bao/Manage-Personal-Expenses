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