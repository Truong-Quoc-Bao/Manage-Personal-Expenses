app.get('/api/callback/:userId', async (req, res) => {
  // 1. Lấy dữ liệu từ tham số
  const { userId } = req.params; // Đây là ID lấy từ URL (ví dụ: 4f4b144d-...)
  const { link_token, external_id } = req.query; // external_id bây giờ là "user_ID_9999"

  console.log('🚨 ĐÃ NHẬN CALLBACK');
  console.log('- User ID gốc:', userId);
  console.log('- External ID nhận từ SePay:', external_id);

  if (!link_token || !userId) {
    return res.status(400).send('Thiếu thông tin từ SePay');
  }

  try {
    // ... (Giữ nguyên đoạn lấy Access Token của em) ...
    // ... (Giữ nguyên đoạn gọi API link-token/${link_token} của em) ...

    // 2. Lấy thông tin ngân hàng
    const responseData = accountDetailRes.data.data || accountDetailRes.data;
    const bankAccount = responseData.bank_account;
    const accName = `${bankAccount.bank_name} - ${bankAccount.account_number}`;

    // 3. LƯU VÀO DATABASE
    // QUAN TRỌNG: Dùng chính cái userId từ req.params để lưu
    await pool.query(
      `INSERT INTO account_service.accounts (user_id, account_name, balance, type, currency)
       VALUES ($1, $2, 0, 'bank', 'VND')
       ON CONFLICT (user_id, account_name) DO UPDATE SET updated_at = NOW()`,
      [userId, accName], // Lưu đúng ID gốc của Bảo vào DB
    );

    console.log('✅ THÀNH CÔNG: Đã lưu tài khoản', accName);
    res.redirect('https://ba-da-fu-ta-food.vercel.app?status=linked_success');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    res.redirect('https://ba-da-fu-ta-food.vercel.app?status=linked_failed');
  }
});
