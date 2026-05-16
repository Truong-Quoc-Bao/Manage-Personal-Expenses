import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config({ path: '../.env' });

async function getStats() {
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

    const res = await axios.get(`https://bankhub-api-sandbox.sepay.vn/v1/company/counter/${xid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('📈 THỐNG KÊ GIAO DỊCH:', res.data.data);
  } catch (e) {
    console.error('❌ Lỗi:', e.message);
  }
}
getStats();
