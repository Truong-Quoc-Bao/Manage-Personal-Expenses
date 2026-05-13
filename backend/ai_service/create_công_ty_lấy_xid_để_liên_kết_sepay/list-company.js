import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config({ path: '../.env' });

async function listCompany() {
  try {
    const authString = Buffer.from(`${process.env.BANKHUB_CLIENT_ID}:${process.env.BANKHUB_CLIENT_SECRET}`).toString('base64');
    const tokenRes = await axios.post('https://bankhub-api-sandbox.sepay.vn/v1/token', {}, {
      headers: { 'Authorization': `Basic ${authString}` }
    });
    const token = tokenRes.data.access_token;

    const res = await axios.get('https://bankhub-api-sandbox.sepay.vn/v1/company', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📋 DANH SÁCH CÔNG TY:');
    console.table(res.data.data.map(c => ({ Tên: c.full_name, XID: c.xid, Trạng_Thái: c.status })));
  } catch (e) { console.error('❌ Lỗi:', e.message); }
}
listCompany();