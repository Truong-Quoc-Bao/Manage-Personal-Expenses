import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config({ path: '../.env' });

async function updateCompany() {
  const xid = process.env.BANKHUB_COMPANY_XID;
  try {
    const authString = Buffer.from(
      `${process.env.BANKHUB_CLIENT_ID}:${process.env.BANKHUB_CLIENT_SECRET}`,
    ).toString('base64');
    const tokenRes = await axios.post(
      'https://bankhub-api-sandbox.sepay.vn/v1/token',
      {},
      {
        headers: { Authorization: `Basic ${authString}` },
      },
    );
    const token = tokenRes.data.access_token;

    const updateData = {
      full_name: 'Công ty Quốc Bảo Đã Cập Nhật',
      address: 'Địa chỉ mới, TP.HCM',
    };

    const res = await axios.post(
      `https://bankhub-api-sandbox.sepay.vn/v1/company/edit/${xid}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      },
    );

    console.log('✅ CẬP NHẬT THÀNH CÔNG:', res.data);
  } catch (e) {
    console.error('❌ Lỗi:', e.message);
  }
}
updateCompany();
