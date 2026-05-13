import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '../.env' });

async function cleanEverything() {
  const baseURL = 'https://bankhub-api-sandbox.sepay.vn/v1';
  const clientId = process.env.BANKHUB_CLIENT_ID;
  const clientSecret = process.env.BANKHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Lỗi: Check file .env xem có API Key chưa!');
    return;
  }

  try {
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // 1. Lấy Token
    console.log('🔑 1. Đang lấy Token...');
    const tokenRes = await axios.post(
      `${baseURL}/token`,
      {},
      {
        headers: { Authorization: `Basic ${authString}` },
      },
    );
    const token = tokenRes.data.access_token;

    // 2. Lấy danh sách toàn bộ công ty
    console.log('🔍 2. Đang quét danh sách công ty...');
    const listRes = await axios.get(`${baseURL}/company`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const companies = listRes.data.data || [];

    if (companies.length === 0) {
      console.log('✅ Hệ thống đã sạch sẽ, không có công ty nào để xoá.');
      return;
    }

    console.log(`🗑️ Tìm thấy ${companies.length} công ty. Bắt đầu xoá sạch...`);

    // 3. Vòng lặp xoá từng cái một
    for (const c of companies) {
      try {
        await axios.delete(`${baseURL}/company/${c.xid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`   ✅ Đã xoá: ${c.full_name} (${c.xid})`);
      } catch (err) {
        console.error(`   ❌ Không thể xoá ${c.full_name}: ${err.message}`);
      }
    }

    console.log(
      '\n✨ XONG! Bây giờ em hãy chạy lại file `create-company.js` để tạo 1 cái DUY NHẤT mới tinh nhé.',
    );
  } catch (error) {
    console.error('❌ Lỗi hệ thống:', error.message);
  }
}

cleanEverything();
