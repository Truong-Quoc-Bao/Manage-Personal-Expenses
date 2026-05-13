import dotenv from 'dotenv';
import axios from 'axios';

// 1. Load cấu hình từ file .env
dotenv.config();

async function createNewCompany() {
  console.log('🚀 Bắt đầu quá trình tạo Công ty mới...');

  const clientId = process.env.BANKHUB_CLIENT_ID;
  const clientSecret = process.env.BANKHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Lỗi: Không tìm thấy CLIENT_ID hoặc CLIENT_SECRET trong file .env');
    return;
  }

  try {
    // BƯỚC 1: LẤY ACCESS TOKEN
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    console.log('🔑 1. Đang lấy Access Token...');
    const tokenRes = await axios.post(
      'https://bankhub-api-sandbox.sepay.vn/v1/token',
      {},
      {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
      },
    );
    const accessToken = tokenRes.data.access_token;
    console.log('✅ Đã lấy Token thành công.');

    // BƯỚC 2: TẠO CÔNG TY (Dùng đúng link /v1/company/create em đưa)
    console.log('🏗️ 2. Đang gọi API tạo Công ty mới...');

    // Tạo tên ngẫu nhiên để không bị trùng tên trong hệ thống SePay
    const randomSuffix = Math.floor(Math.random() * 9999);
    const companyData = {
      full_name: `Tập Đoàn Quốc Bảo #${randomSuffix}`,
      short_name: `BAO${randomSuffix}`,
      status: 'Active', // Hoặc "Pending" như em yêu cầu
    };

    // ... (Giữ nguyên phần trên)
    const createRes = await axios.post(
      'https://bankhub-api-sandbox.sepay.vn/v1/company/create',
      companyData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // IN TOÀN BỘ JSON ĐỂ KIỂM TRA CẤU TRÚC
    console.log('🔍 DỮ LIỆU THỰC TẾ TỪ SEPAY:', JSON.stringify(createRes.data, null, 2));

    // Thường SePay trả về dạng createRes.data.data.xid
    const actualData = createRes.data.data || createRes.data;
    const finalXid = actualData.xid;
    const finalName = actualData.full_name;

    console.log('\n-----------------------------------------');
    console.log('🎉 TẠO CÔNG TY THÀNH CÔNG!');
    console.log('👉 MÃ XID MỚI CỦA EM:', finalXid);
    console.log('👉 TÊN CÔNG TY:', finalName);
    console.log('-----------------------------------------');
    console.log('\nHÀNH ĐỘNG TIẾP THEO:');
    console.log(`1. Copy mã xid: ${createRes.data.xid}`);
    console.log('2. Dán vào biến BANKHUB_COMPANY_XID trong file .env');
    console.log('3. Restart lại Server chính (4005) và test liên kết ngân hàng lại.');
  } catch (error) {
    console.error('\n❌ LỖI KHI GỌI SEPAY:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

createNewCompany();
