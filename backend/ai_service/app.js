import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MONEY_GUARD_RULES } from './systemRules.js';
import multer from 'multer';
import pg from 'pg';
import { createServer } from 'http';
import { Server } from 'socket.io';
import webpush from 'web-push';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const { Pool } = pg;

// Cấu hình kết nối (thay thông tin đúng với máy Bảo)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Kiểm tra kết nối
pool.connect((err) => {
  if (err) console.error('❌ Lỗi kết nối Postgres:', err.stack);
  else console.log('✅ Đã kết nối PostgreSQL thành công');
});

// dotenv.config();
const app = express();

// Khởi tạo httpServer và Socket.io ngay từ đầu
const httpServer = createServer(app);
// soket
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// // liên kết ngân hàng
// const httpServer = createServer(app); // Tạo server http
// const io = new Server(httpServer); // Gắn socket.io vào server

// Cấu hình multer để xử lý file ảnh (lưu tạm trong bộ nhớ)
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json({ limit: '10mb' })); // tránh bị spam payload lớn
app.use(express.static('public')); // phục vụ index.html, css, js

const PORT = process.env.PORT || 4005;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY chưa được set trong file .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

let chatHistory = [];

// Biến tạm để lưu thông tin trình duyệt của Bảo (Sau này nên lưu vào DB)
let lastUserMessage = { time: 0, content: '' };
let lastSavedTransaction = { time: 0, content: '' };
let subscriptions = [];

// 1. Cấu hình Web Push
webpush.setVapidDetails(
  'mailto:baotruong.190404@gmail.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY,
);

app.post('/login', (req, res) => {
  // ... logic kiểm tra đăng nhập ...
  // Trả về ID để frontend sử dụng
  res.json({
    success: true,
    user: {
      id: userFromDb.user_id, // Đây chính là cái ID n8n cần
      name: userFromDb.user_name,
    },
  });
});

// Hàm đứng gác ở các API cần đăng nhập
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || token === 'Bearer null') {
    console.log('⚠️ Không có token, mặc định dùng User ID: 1');
    req.user = { user_id: 1 }; // Gán mặc định là Bảo để chạy được
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) {
      console.log('Token sai hoặc hết hạn!');
      req.user = { user_id: 1 }; // fallback
      return res.status(403).json({ error: 'Phiên đăng nhập hết hạn' });
    }
    // Lưu thông tin user vào req.user (trong này sẽ có req.user.user_id)
    req.user = user;
    next();
  });
};

// --- API LẤY THỐNG KÊ CHO DASHBOARD ---
app.get('/api/stats', async (req, res) => {
  try {
    const userId = 1;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Lấy Tổng Thu, Tổng Chi của tháng hiện tại
    const totalsRes = await pool.query(
      `
        SELECT 
          SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END) as total_income,
          SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END) as total_expense
        FROM transactions t
        JOIN accounts a ON t.account_id = a.account_id
        WHERE a.user_id = $1 
          AND EXTRACT(MONTH FROM t.date) = $2 
          AND EXTRACT(YEAR FROM t.date) = $3
      `,
      [userId, currentMonth, currentYear],
    );

    // 2. Lấy danh sách danh mục (Tách làm 2 loại)
    const categoryRes = await pool.query(
      `
      SELECT 
        COALESCE(c.category_name, 'Chưa phân loại') as category_name, 
        SUM(t.amount) as amount, 
        t.transaction_type
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.category_id -- Dùng LEFT JOIN ở đây
      JOIN accounts a ON t.account_id = a.account_id
      WHERE a.user_id = $1 
        AND EXTRACT(MONTH FROM t.date) = $2 
        AND EXTRACT(YEAR FROM t.date) = $3
      GROUP BY c.category_name, t.transaction_type
    `,
      [userId, currentMonth, currentYear],
    );

    // CHUẨN HÓA DỮ LIỆU TRẢ VỀ CHO FRONTEND
    const incomeCategories = categoryRes.rows.filter((r) => r.transaction_type === 'income');
    const expenseCategories = categoryRes.rows.filter((r) => r.transaction_type === 'expense');

    res.json({
      income: parseFloat(totalsRes.rows[0].total_income || 0),
      expense: parseFloat(totalsRes.rows[0].total_expense || 0),
      incomeCategories: incomeCategories, // Mảng dành cho tab Thu nhập
      expenseCategories: expenseCategories, // Mảng dành cho tab Chi tiêu
      month: currentMonth,
      year: currentYear,
    });
  } catch (err) {
    console.error('Lỗi lấy thống kê:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Route lấy toàn bộ lịch sử chat để hiện lên màn hình khi load trang
app.get('/chat-history', authenticateToken, async (req, res) => {
  try {
    // const userId = req.user.user_id;
    const userId = 1; // Tạm thời fix là Bảo
    const result = await pool.query(
      'SELECT role, message FROM message_history WHERE user_id = $1 ORDER BY created_at ASC',
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === THÊM ROUTE NÀY VÀO SERVER ===
app.get('/vapid-public-key', (req, res) => {
  const publicKey = process.env.PUBLIC_VAPID_KEY;

  if (!publicKey) {
    console.error('❌ PUBLIC_VAPID_KEY chưa có trong .env');
    return res.status(500).json({ error: 'VAPID key not configured' });
  }

  res.json({ publicVapidKey: publicKey });
});

// 2. Endpoint để trình duyệt gửi "địa chỉ nhận tin" lên server
app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  // Kiểm tra xem đã tồn tại chưa (tránh lưu trùng)
  const exists = subscriptions.some((sub) => sub.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
    console.log('🔔 Đã lưu subscription mới! Tổng:', subscriptions.length, 'thiết bị');
    console.log('Endpoint:', subscription.endpoint.substring(0, 60) + '...');
  } else {
    console.log('🟡 Subscription này đã tồn tại');
  }

  res.status(201).json({ success: true });
});

// Thêm route này vào server
app.get('/debug-subscriptions', (req, res) => {
  res.json({
    total: subscriptions.length,
    subscriptions: subscriptions.map((s) => ({
      endpoint: s.endpoint.substring(0, 80) + '...',
      keys: !!s.keys,
    })),
  });
});

// 3. Hàm bắn thông báo (Sẽ gọi trong Webhook ngân hàng)
const sendPushNotification = (message) => {
  console.log(`📲 Đang gửi Web Push đến ${subscriptions.length} thiết bị...`);

  const payload = JSON.stringify({
    title: '🏦 Money Guard THÔNG BÁO',
    body: message,
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968890.png',
  });

  subscriptions.forEach((sub, index) => {
    webpush
      .sendNotification(sub, payload)
      .then(() => console.log(`   ✅ Đã gửi Banner thành công cho thiết bị #${index + 1}`))
      .catch((err) => {
        console.error(`   ❌ Lỗi gửi Banner thiết bị #${index + 1}:`, err.message);
        // Nếu lỗi 410 (Gone) nghĩa là trình duyệt đã hủy đăng ký, nên xóa sub đó đi
      });
  });
};

// --- HÀM HỖ TRỢ PHÁT HIỆN CHI TIÊU BẤT THƯỜNG ---
async function getAnomalyStatus(userId, categoryName, amount) {
  try {
    const res = await pool.query(
      `
      SELECT AVG(t.amount) as average 
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      JOIN accounts a ON t.account_id = a.account_id
      WHERE a.user_id = $1 AND c.category_name ILIKE $2
    `,
      [userId, categoryName],
    );

    const avg = parseFloat(res.rows[0].average || 0);
    // Nếu tiêu gấp 3 lần trung bình hạng mục đó thì báo động
    if (avg > 0 && amount > avg * 3) {
      return { isAnomaly: true, factor: Math.round(amount / avg) };
    }
    return { isAnomaly: false };
  } catch (err) {
    return { isAnomaly: false };
  }
}

// --- API TẠO LINK LIÊN KẾT NGÂN HÀNG TỰ ĐỘNG ---
// --- API TẠO LINK LIÊN KẾT NHẢY THẲNG NGÂN HÀNG (BANK HUB SANDBOX) ---
app.get('/api/get-magic-link', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.user_id || 1;
    await pool.query('UPDATE users SET linking_at = NOW() WHERE user_id = $1', [userId]);

    // 1. Thông tin định danh (Dùng Sandbox)
    const clientId = 'BH-SB-TRUONG-QUOC-BAO-6908C837';
    const clientSecret = '97c68602dc26d169e630dd14a51ab97e489a608d8906055cec8d78a3f09b38ad';
    const companyXid = 'DGLNEMX5HSZHP1AMSEQ09NR4Q308BJY9LZYTEWUYIBKVAC5TOHI3ZJ2FTURCSDL6';

    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Header để lừa Cloudflare (Cực kỳ quan trọng)
    const headers = {
      Authorization: `Basic ${authString}`,
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Content-Type': 'application/json',
    };

    // BƯỚC 1: Lấy Access Token
    const tokenRes = await axios.post(
      'https://bankhub-api-sandbox.sepay.vn/v1/token',
      {},
      { headers },
    );
    const accessToken = tokenRes.data.access_token;

    console.log('STEP 1: get token');
    console.log(tokenRes.data);

    // BƯỚC 2: Tạo link nhảy thẳng (Hosted Link)
    const linkRes = await axios.post(
      'https://bankhub-api-sandbox.sepay.vn/v1/link-token',
      {
        company_xid: companyXid,
        purpose: 'LINK_BANK_ACCOUNT',
        completion_redirect_uri: 'http://localhost:4005/',
        external_id: `user_${userId}`, // 🔥 QUAN TRỌNG
      },
      { headers: { ...headers, Authorization: `Bearer ${accessToken}` } },
    );
    console.log('STEP 2: create link');
    console.log(linkRes.data);
    // 3. Trả về cái link "Ma thuật"
    res.json({ url: linkRes.data.hosted_link_url });
  } catch (err) {
    console.error('❌ Lỗi:', err.response?.data || err.message);
    res.status(500).json({ error: 'Lỗi kết nối cổng ngân hàng' });
  }
});

// --- LOG QUÁ TRÌNH XỬ LÝ GIAO DỊCH (BANK) ---
app.post('/webhook/bank-transfer', authenticateToken, async (req, res) => {
  console.log('\n--- 🚀 [BẮT ĐẦU NHẬN WEBHOOK TỪ SEPAY] ---');

  try {
    const {
      content,
      transferAmount,
      transfer_amount,
      amount_out,
      amount_in,
      transferType,
      accountNumber,
      gateway,
    } = req.body;

    // 🕵️‍♂️ ĐÂY LÀ "CHỐT CHẶN" - PHẢI ĐƯA LÊN TRÊN CÙNG
    if (gateway === 'Chatbot AI') {
      console.log(
        '🔇 [CHATBOT]: Giao dịch này đến từ Chatbot, n8n đã check hạn mức xong. Không lưu trùng vào DB.',
      );
      return res.status(200).json({ status: 'Success', message: 'Ignored duplicate save for AI' });
    }

    // --- NẾU LÀ NGÂN HÀNG THẬT THÌ MỚI CHẠY TIẾP XUỐNG DƯỚI ---

    const finalAmount = parseFloat(
      transferAmount || transfer_amount || amount_out || amount_in || 0,
    );
    const userId = 1;
    // const userId = req.user.user_id;

    // 1. PHÂN BIỆT LOẠI GIAO DỊCH (VÀO hay RA)
    // SePay gửi "in" là tiền vào, "out" là tiền ra
    const isIncome = transferType === 'in';
    const transactionType = isIncome ? 'income' : 'expense';

    if (finalAmount === 0) return res.status(200).send('No amount');

    console.log(`💰 [${transactionType.toUpperCase()}] Số tiền: ${finalAmount}đ`);

    let targetUserId = 1;
    let targetAccountId = 1;

    // Kiểm tra STK này đã có trong hệ thống chưa
    let accRes = await pool.query(
      'SELECT user_id, account_id FROM accounts WHERE account_number = $1',
      [accountNumber],
    );

    if (accRes.rows.length === 0) {
      // Nếu chưa có, tìm xem 10 phút qua có ai nhấn nút "Liên kết" không
      const finder = await pool.query(
        `SELECT user_id FROM users 
         WHERE linking_at >= (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh') - INTERVAL '10 minutes' 
         ORDER BY linking_at DESC LIMIT 1`,
      );

      if (finder.rows.length > 0) {
        targetUserId = finder.rows[0].user_id;
        // Tự động tạo bản ghi Ngân hàng cho User đó
        const newAcc = await pool.query(
          'INSERT INTO accounts (user_id, account_name, account_number) VALUES ($1, $2, $3) RETURNING account_id',
          [targetUserId, gateway || 'Ngân hàng mới', accountNumber],
        );
        targetAccountId = newAcc.rows[0].account_id;
        // Xóa dấu vết để không nhận nhầm
        await pool.query('UPDATE users SET linking_at = NULL WHERE user_id = $1', [targetUserId]);
      } else {
        return res.status(200).send('Unknown account');
      }
    } else {
      targetUserId = accRes.rows[0].user_id;
      targetAccountId = accRes.rows[0].account_id;
    }

    // 2. NHỜ AI PHÂN LOẠI (Gửi thêm ngữ cảnh là Tiền vào hay Tiền ra)
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

    const promptBankAI = `
      Bạn là hệ thống AI phân tích giao dịch ngân hàng thông minh của app Money Guard.
      Dưới đây là thông tin giao dịch nhận được từ ngân hàng:
      - Nội dung chuyển khoản gốc: "${content}"
      - Chiều giao dịch: ${
        isIncome ? 'TIỀN VÀO (Bạn nhận được tiền)' : 'TIỀN RA (Bạn chuyển tiền đi)'
      }

      [NHIỆM VỤ CỦA BẠN]:
      Hãy phân tích và trả về định dạng JSON theo đúng 2 yêu cầu sau:
      
      1. "clean_name": Làm sạch nội dung chuyển khoản cho dễ đọc. Lược bỏ các mã số giao dịch rác của ngân hàng (VD: MBBANK, FT230..., IBFT...). 
        (Ví dụ: "NGUYEN VAN A CHUYEN TIEN 123456" -> "${
          isIncome ? 'Nguyễn Văn A chuyển tiền' : 'Chuyển tiền cho Nguyễn Văn A'
        }")
      
      2. "category_name": Phân loại danh mục tự động. Dựa vào chiều giao dịch, hãy áp dụng quy tắc:
        ${
          isIncome
            ? '=> Đây là TIỀN VÀO: Hãy phân loại vào một trong các danh mục: "Lương", "Người khác chuyển", "Tiền thưởng", "Thu nhập khác".'
            : '=> Đây là TIỀN RA: Nếu thấy tên người, hãy xếp vào "Chuyển cho người khác". Nếu thấy tên cửa hàng/dịch vụ, hãy xếp vào "Ăn uống", "Mua sắm", "Hóa đơn", v.v...'
        }

      [RÀNG BUỘC BẮT BUỘC]:
      Tuyệt đối CHỈ xuất ra một chuỗi JSON duy nhất, KHÔNG có markdown, KHÔNG có thẻ \`\`\`json, KHÔNG giải thích thêm.
      Định dạng chuẩn: {"category_name": "...", "clean_name": "..."}
    `;

    let aiData;

    try {
      const aiResponse = await model.generateContent(promptBankAI);
      const text = aiResponse.response.text();

      // Dùng Regex tìm đúng khối JSON (Phòng hờ AI bị điên vẫn nhả markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI không trả về JSON hợp lệ');
      }
    } catch (e) {
      console.error('⚠️ Lỗi Parse JSON AI (Dùng dữ liệu gốc):', e.message);
      // Fallback: Nếu AI lỗi thì vẫn lưu DB bình thường với tên gốc
      aiData = {
        category_name: isIncome ? 'Thu nhập' : 'Khác',
        clean_name: content,
      };
    }

    // 3. LƯU DATABASE (Dùng đúng transactionType)
    let catRes = await pool.query(
      `SELECT category_id FROM categories WHERE category_name ILIKE $1 AND user_id = $2 LIMIT 1`,
      [aiData.category_name, userId],
    );

    let categoryId;
    if (catRes.rows.length > 0) {
      categoryId = catRes.rows[0].category_id;
    } else {
      const newCat = await pool.query(
        "INSERT INTO categories (user_id, category_name, type, icon, color) VALUES ($1, $2, $3, '🏦', 'blue') RETURNING category_id",
        [userId, aiData.category_name, transactionType],
      );
      categoryId = newCat.rows[0].category_id;
    }

    const nowICT = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });

    await pool.query(
      `INSERT INTO transactions (account_id, category_id, amount, transaction_type, description, date, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        // 1,
        targetAccountId,
        categoryId,
        finalAmount,
        transactionType,
        aiData.clean_name,
        nowICT,
        `Nguồn: ${gateway || 'Bank'}`,
      ],
    );

    // 4. THÔNG BÁO THÔNG MINH (Thay đổi câu chữ dựa trên isIncome)
    let notificationMsg = '';
    if (isIncome) {
      notificationMsg = `💰 **Ting ting!** Money Guard thấy Bảo vừa **nhận được** **${finalAmount.toLocaleString()}đ** từ "${
        aiData.clean_name
      }". Chúc mừng Bảo có thêm thu nhập! 🥳`;
    } else {
      notificationMsg = `💸 **Ting ting!** Money Guard thấy Bảo vừa **chuyển đi** **${finalAmount.toLocaleString()}đ** cho "${
        aiData.clean_name
      }". Đã ghi vào sổ rồi nhé!`;
    }

    // 5.MỚI: LƯU VÀO LỊCH SỬ CHAT (Để khi F5 web nó vẫn hiện ra)
    try {
      await pool.query('INSERT INTO message_history (user_id, role, message) VALUES ($1, $2, $3)', [
        targetUserId,
        'model',
        notificationMsg,
      ]);
      console.log('💾 Đã lưu thông báo ngân hàng vào lịch sử chat');
    } catch (chatErr) {
      console.error('❌ Lỗi lưu lịch sử chat ngân hàng:', chatErr.message);
    }

    // 6.Bắn socket và push thông báo
    io.emit('bank_notification', { message: notificationMsg });

    if (typeof sendPushNotification === 'function') {
      sendPushNotification(notificationMsg);
    }

    console.log(`✅ Thành công: ${notificationMsg}`);
    res.status(200).json({ status: 'Success' });
  } catch (err) {
    console.error('❌ LỖI:', err.message);
    res.status(200).send('Error');
  }
});

app.post('/chat', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { message } = req.body;
    const imageFile = req.file; // Lấy file ảnh nếu có
    const currentUserId = 1;
    // const currentUserId = req.user.user_id;

    // CHẶN NGAY TỪ ĐẦU NẾU LỖI
    if (message.length > 30000) {
      return res.status(400).json({ error: 'Message quá dài (tối đa ~30k ký tự)' });
    }
    // Kiểm tra nếu cả chữ và ảnh đều trống thì báo lỗi
    if (!message && !imageFile) {
      return res.status(400).json({ error: 'Bảo ơi, hãy nhập tin nhắn hoặc gửi ảnh nhé!' });
    }

    // 🕵️‍♂️ CHỐT CHẶN DOUBLE SUBMIT: Kiểm tra nguyên cái tin nhắn
    const messageKey = `${currentUserId}-${message}`;
    const nowBlock = Date.now();

    if (lastUserMessage.content === messageKey && nowBlock - lastUserMessage.time < 3000) {
      console.log('🚫 Chặn Double Submit tin nhắn');
      return res.json({ reply: 'Bảo ơi, từ từ thôi, Moni đang xử lý tin nhắn trước đó rồi!' });
    }
    lastUserMessage = { time: nowBlock, content: messageKey };

    // Lưu lại tin nhắn vừa gửi để so sánh với tin tiếp theo
    lastSavedTransaction = { time: nowBlock, content: messageKey };

    // ==========================================
    // VỊ TRÍ 1: DÁN ĐOẠN LƯU TIN NHẮN USER TẠI ĐÂY
    // ==========================================
    try {
      await pool.query('INSERT INTO message_history (user_id, role, message) VALUES ($1, $2, $3)', [
        currentUserId,
        'user',
        message || '[Gửi ảnh]',
      ]);
      console.log('💾 Đã lưu tin nhắn của Bảo vào DB');
    } catch (err) {
      console.error('❌ Lỗi lưu tin nhắn user:', err.message);
    }

    // 2. Dữ liệu giả lập (Sau này lấy từ DB)
    // const stats = { total: '5.649.011đ', count: 60, avg: '182.226đ', month: '3/2026', age: 21 };

    // --- 2. LẤY DỮ LIỆU THẬT TỪ DATABASE ---
    // const currentUserId = 1; // ID của Bảo trong DB
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const currentDayName = daysOfWeek[now.getDay()];
    const currentDate = now.toLocaleDateString('en-CA');

    // Truy vấn tổng chi tiêu và số giao dịch của tháng hiện tại
    // const statsRes = await pool.query(
    //   `
    // SELECT
    //     COALESCE(SUM(amount), 0) as total,
    //     COUNT(*) as count
    // FROM transactions t
    // JOIN accounts a ON t.account_id = a.account_id
    // WHERE a.user_id = $1
    //   AND EXTRACT(MONTH FROM t.date) = $2
    //   AND EXTRACT(YEAR FROM t.date) = $3
    //   AND t.transaction_type = 'expense'
    // `,
    //   [currentUserId, currentMonth, currentYear],
    // );

    // QUERY 1: Lấy chi tiết hạng mục
    const categoryStatsRes = await pool.query(
      `
        SELECT 
            c.category_name, 
            COALESCE(SUM(t.amount), 0) as spent,
            (SELECT amount_limit FROM budgets b WHERE b.category_id = c.category_id AND b.month = $2 AND b.year = $3 AND b.user_id = $1) as limit_amount
        FROM categories c
        LEFT JOIN transactions t ON c.category_id = t.category_id 
            AND EXTRACT(MONTH FROM t.date) = $2 
            AND EXTRACT(YEAR FROM t.date) = $3
            AND t.transaction_type = 'expense'
        WHERE c.user_id = $1
        GROUP BY c.category_id, c.category_name
    `,
      [currentUserId, currentMonth, currentYear],
    );

    // QUERY 2: Lấy TỔNG CHI TIÊU và TỔNG SỐ GIAO DỊCH của cả tháng (Để tính stats tổng)
    const overallStatsRes = await pool.query(
      `
      SELECT 
          COUNT(CASE WHEN t.transaction_type = 'expense' THEN 1 END) as expense_count,
          COUNT(CASE WHEN t.transaction_type = 'income' THEN 1 END) as income_count,
          COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expense,
          COALESCE(SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END), 0) as total_income
      FROM transactions t
      JOIN accounts a ON t.account_id = a.account_id
      WHERE a.user_id = $1 
        AND EXTRACT(MONTH FROM t.date) = $2 
        AND EXTRACT(YEAR FROM t.date) = $3
      `,
      [currentUserId, currentMonth, currentYear],
    );

    const row = overallStatsRes.rows[0];
    const totalExpense = parseFloat(row.total_expense);
    const totalIncome = parseFloat(row.total_income);
    const expenseCount = parseInt(row.expense_count) || 0; // Chỉ đếm số lần tiêu tiền
    const incomeCount = parseInt(row.income_count) || 0; // Chỉ đếm số lần nhận tiền
    const balance = totalIncome - totalExpense;
    const totalAmount = totalIncome + totalExpense; // Gán để tính trung bình chi tiêu hàng ngày

    // --- TÍNH TOÁN THỜI GIAN CHO DỰ BÁO ---
    // Tính trung bình mỗi ngày dựa trên số ngày đã qua trong tháng
    const dayOfMonth = now.getDate();
    const dailyAvg = totalExpense > 0 ? Math.round(totalExpense / dayOfMonth) : 0;

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const daysLeft = daysInMonth - daysPassed;
    const projectedTotal = totalExpense + dailyAvg * daysLeft; // dailyAvg Bảo đã có ở trên rồi

    // const totalAmount = parseFloat(overallData.total_spent) || 0; // Nếu null thì về 0
    // const dbData = overallStatsRes.rows[0];
    // const totalAmount = parseFloat(dbData.total);
    // const transactionCount = parseInt(dbData.count);

    // Tạo báo cáo danh mục
    const categoryReport =
      categoryStatsRes.rows.length > 0
        ? categoryStatsRes.rows
            .map((r) => {
              const spent = Number(r.spent);
              const limit = r.limit_amount ? Number(r.limit_amount) : 0;
              const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
              let statusText = '';

              if (limit > 0 && spent > limit) {
                statusText = `🚨 [VƯỢT HẠN MỨC ${spent - limit}đ]`;
              } else if (limit > 0 && percent >= 80) {
                statusText = `⚠️ [SẮP CHẠM NGƯỠNG - Đã tiêu ${percent}%]`;
              }

              return `- ${r.category_name}: ${spent.toLocaleString('vi-VN')}đ / Hạn mức: ${
                limit > 0 ? limit.toLocaleString('vi-VN') + 'đ' : 'Chưa đặt'
              } ${statusText}`;
            })
            .join('\n')
        : 'Chưa có chi tiêu nào.';

    // Lấy 5 giao dịch gần nhất để AI biết lịch sử (Dùng cho Anomaly Detection & CRUD)
    const recentTransactionsRes = await pool.query(
      `
          SELECT t.trans_id, t.description, t.amount, t.date, c.category_name
          FROM transactions t
          JOIN categories c ON t.category_id = c.category_id
          JOIN accounts a ON t.account_id = a.account_id
          WHERE a.user_id = $1
          ORDER BY t.created_at DESC LIMIT 10
      `,
      [currentUserId],
    );

    const recentData = recentTransactionsRes.rows
      .map(
        (t) =>
          `ID:${t.trans_id} | ${t.date.toISOString().split('T')[0]} | ${
            t.description
          } | ${parseFloat(t.amount).toLocaleString()}đ`,
      )
      .join('\n');

    const stats = {
      total: totalAmount.toLocaleString('vi-VN') + 'đ',
      expense: totalExpense.toLocaleString('vi-VN') + 'đ',
      income: totalIncome.toLocaleString('vi-VN') + 'đ',
      balance: balance.toLocaleString('vi-VN') + 'đ',
      expense_count: expenseCount,
      income_count: incomeCount,
      // count: expenseCount + incomeCount,
      avg: dailyAvg.toLocaleString('vi-VN') + 'đ',
      month: `${currentMonth}/${currentYear}`,
      age: 21,
      today: currentDate,
    };

    // --- LOGIC CHẶN AI ẢO GIÁC ---
    let adviceContext = '';
    if (totalExpense > totalIncome && totalIncome > 0) {
      adviceContext = `[CẢNH BÁO NGUY HIỂM]: Bảo đang tiêu vượt mức thu nhập (${stats.expense} > ${stats.income}). Hãy mắng thật gắt!`;
    } else if (totalIncome === 0 && totalExpense > 0) {
      adviceContext = `[GHI CHÚ]: Bảo chưa nhập thu nhập tháng này, chỉ toàn thấy chi ra thôi.`;
    }

    console.log(`📊 Đã nạp dữ liệu thật tháng ${stats.month} cho Money Guard: ${stats.total}`);
    console.log(
      `📊 Stats nạp cho Money Guard: [${stats.count} GD] | Chi: ${stats.expense} | Thu: ${stats.income}`,
    );
    // 3. Logic: Chỉ hiện số liệu nếu Bảo hỏi về chi tiêu/tiền bạc
    const isAskingAboutMoney = /tiền|chi tiêu|báo cáo|bao nhiêu|tổng|tháng/i.test(message);

    let contextData = '';
    if (isAskingAboutMoney) {
      contextData = `[DỮ LIỆU TÀI CHÍNH THẬT]: Tháng ${stats.month}, Tổng chi ${stats.total}, ${stats.count} giao dịch.`;
    }

    // 2. Tạo Prompt tổng hợp ngữ cảnh
    const inputPrompt = `
    [THÔNG TIN HỆ THỐNG - TỐI MẬT]:
    [DỮ LIỆU THẬT THÁNG ${stats.month}]:
    - Tổng cả thu và chi: ${stats.total}
    - Tổng Chi: ${stats.expense} (${stats.expense_count} lần chi)
    - Tổng Thu: ${stats.income} (${stats.income_count} lần nhận)
    - Số dư: ${stats.balance}
    - Giao dịch: ${stats.count}
    ${adviceContext}

    [NGỮ CẢNH HỆ THỐNG]:
    Dưới đây là dữ liệu tài chính của Bảo:
    - THỜI GIAN THỰC: Hôm nay là ${currentDayName}, ngày ${currentDate}.
    - Tháng: ${stats.month} | Tổng chi: ${stats.total} | Giao dịch: ${stats.count} | TB/ngày: ${
      stats.avg
    }
    - TIẾN ĐỘ THÁNG: Đã qua ${daysPassed} ngày, còn lại ${daysLeft} ngày.
    - DỰ BÁO CUỐI THÁNG (AI Prediction): ${projectedTotal.toLocaleString('vi-VN')}đ.
    - SO SÁNH DỰ BÁO: ${
      projectedTotal > totalIncome ? '🚨 Nguy cơ chi vượt thu!' : '✅ Vẫn trong tầm kiểm soát'
    }.
    - Báo cáo hạng mục & Ngân sách:
    ${categoryReport}
    - 5 Giao dịch gần nhất của Bảo:
    ${recentData}

    [YÊU CẦU XỬ LÝ NGÀY THÁNG]:
    1. Nếu Bảo nói "hôm nay" hoặc không nói ngày: Dùng ngày ${currentDate}.
    2. Nếu Bảo nói "hôm qua": Bạn tự tính toán lấy ngày ${currentDate} trừ đi 1 ngày (Kết quả phải là 2026-03-27).
    3. Nếu Bảo nói "hôm kia": Trừ đi 2 ngày.
    4. Nếu Bảo nói "thứ mấy" (vd: thứ 2 vừa rồi): Dựa vào hôm nay là ${currentDayName} để suy luận ra ngày chính xác.
    5. LUÔN luôn xuất ngày tháng cuối cùng ở định dạng YYYY-MM-DD bên trong thẻ <transaction>.
    
    [YÊU CẦU XỬ LÝ]:
    - Nếu câu hỏi của Bảo liên quan đến: "chi tiêu", "tiền bạc", "báo cáo", "tháng này", "bao nhiêu tiền", hoặc "tổng kết" -> Hãy lôi dữ liệu trên ra báo cáo chuyên nghiệp theo Rules (4 đoạn, có icon).
    - Nếu Bảo chỉ: "Chào hỏi", "Hỏi danh tính (bạn là ai)", "Nói chuyện phiếm" -> Tuyệt đối KHÔNG hiện số liệu chi tiêu. Hãy trả lời thân thiện, khích lệ và nhắc Bảo tập trung vào mục tiêu tài chính một cách khéo léo.
    - ƯU TIÊN: Nếu Bảo đang cung cấp số tiền cho một món đồ đã nhắc ở câu trước (ví dụ: Bảo gõ "100k"), hãy thực hiện trích xuất <transaction> ngay thay vì hiện báo cáo tổng.

    [NHIỆM VỤ MỞ RỘNG]:
    1. PHÁT HIỆN BẤT THƯỜNG: Nếu Bảo nhập món đồ cao hơn 3 lần mức trung bình các món trước, hãy cảnh báo và xác nhận lại để lưu database và nếu chỉnh database thì nhớ chỉnh luôn note của cái vừa chỉnh 🚨.
    2. DỰ BÁO: Nếu Bảo hỏi về tương lai, hãy lấy tổng chi chia cho ngày hiện tại để dự báo chi tiêu cuối tháng.
    3. NLP CRUD (SỬA/XÓA): 
       - Nếu Bảo muốn xóa (vd: "Xóa món phở nãy đi"), hãy tìm ID trong danh sách "Giao dịch gần nhất" và trả về thẻ <delete_transaction>{"id": ID_CẦN_XÓA}</delete_transaction>.
       - Tương tự cho Sửa: <update_transaction>{"id": ID, "amount": SỐ_TIỀN_MỚI}</update_transaction>.
    4. SMART BUDGET: Nếu chi tiêu hạng mục nào vượt quá Hạn mức, hãy "mắng" thật gắt và yêu cầu cắt giảm.
    5. Khi in ra số dư nếu âm thì phải có dấu - đằng trước balance


    [CÔNG VIỆC CỤ THỂ]:
    1. PHÁT HIỆN BẤT THƯỜNG: So sánh món đồ Bảo vừa nhập với "5 giao dịch gần nhất". Nếu giá cao gấp 3 lần trung bình, hãy dừng lại, mắng Bảo một trận và yêu cầu Bảo xác nhận: "Có thực sự muốn đốt tiền không?" mới được nhả thẻ <transaction>.
    - Nếu giá món đồ cao bất thường (gấp 3 lần trung bình): Bạn PHẢI mắng Bảo và hỏi xác nhận. 
    - TUYỆT ĐỐI KHÔNG được in thẻ <transaction> trong câu hỏi xác nhận này.
    - CHỈ KHI NÀO Bảo trả lời "Đúng rồi", "Lưu đi", "Xác nhận" thì bạn mới được in thẻ <transaction> ở câu trả lời sau đó.

    2. KIỂM TRA TƯƠNG LAI: Nếu Bảo nhập ngày là tương lai (ví dụ hôm nay 31 mà nhập cho ngày 01 tháng sau), hãy hỏi: "Bảo đang tính trước tương lai à? Chắc chắn thì Money Guard mới ghi sổ nhé".

    3. TRUY VẤN DỮ LIỆU (NLP QUERY): 
       - Nếu Bảo hỏi ví dụ "Tháng này uống Cafe bao nhiêu lần và bao nhiêu tiền?", hãy lục lại [Báo cáo hạng mục] và [5 giao dịch gần nhất] để trả lời chính xác. Nếu thông tin không đủ, hãy dựa vào dữ liệu đã có để ước tính.

    4. DỰ BÁO TÀI CHÍNH: Dựa vào tốc độ chi tiêu ${
      stats.avg
    }/ngày, hãy dự báo nếu cứ tiếp tục thế này thì cuối tháng Bảo sẽ thâm hụt bao nhiêu lúa.

    5. NLP CRUD (ĐIỀU KHIỂN CSDL QUA GIỌNG NÓI):
       - XÓA: Nếu Bảo nói "Xóa món...", hãy tìm ID trong danh sách gần nhất và trả về thẻ: <delete_transaction>{"id": ID}</delete_transaction>
       - SỬA: Nếu Bảo nói "Sửa món ID... thành...", trả về thẻ: <update_transaction>{"id": ID, "amount": SỐ_TIỀN_MỚI}</update_transaction>. Khi sửa, hãy tự động cập nhật note thành: "Đã điều chỉnh theo yêu cầu của Bảo".

    6. SMART BUDGET: Nếu hạng mục nào ở [Báo cáo hạng mục] ghi "Vượt hạn mức", hãy kích hoạt chế độ "Chửi gắt" ngay lập tức khi Bảo nhắc đến hạng mục đó.

    7. DỰ BÁO TÀI CHÍNH (PREDICTIVE AI): 
       - Khi Bảo hỏi "Dự báo", "Tháng này ổn không?", hãy dùng con số dự báo ${projectedTotal.toLocaleString()}đ để phân tích. 
       - Nếu số này lớn hơn Thu nhập (${
         stats.income
       }), hãy "dọa" Bảo về việc cuối tháng sẽ hết sạch tiền.

    8. SMART BUDGET (QUẢN LÝ NGÂN SÁCH): 
       - Nhìn vào [Báo cáo hạng mục], nếu thấy hạng mục nào có ghi "🚨 [VƯỢT HẠN MỨC]":
       - Mỗi khi Bảo nhắc đến hoặc nhập thêm món vào hạng mục đó, bạn PHẢI mắng Bảo thật gắt trước khi làm bất cứ việc gì khác. 
       - Dùng giọng điệu "sát thủ tài chính" để ngăn chặn Bảo tiêu thêm.
   
    Nếu người dùng hỏi về thống kê (ví dụ: tháng này tiêu bao nhiêu), hãy trả về một thẻ <query_db>{"type": "total_spending", "month": 4}</query_db> để hệ thống tự truy vấn.
    
    [CÂU HỎI CỦA BẢO]: "${message}"

    [QUY TẮC PHẢN HỒI]: Trình bày theo phong cách hiện đại, sử dụng icon 🚨, 💸, 🛡️, 📈. Tuyệt đối không để lộ mã JSON rác ra ngoài các thẻ quy định.
  `;

    if (message.length > 30000) {
      return res.status(400).json({ error: 'Message quá dài (tối đa ~30k ký tự)' });
    }

    // 3. Khởi tạo Model
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview', // quota free tier thường cao hơn một chút (khoảng 50-1500/ngày tùy thời điểm) // ← dùng cái này, ổn định hơn 2.0, ít lỗi hơn nếu không overload
      systemInstruction: MONEY_GUARD_RULES, // Gọi biến từ file rules vào đây
    });

    // console.log('--- 1. LỊCH SỬ CHAT TRƯỚC KHI GỬI ---');
    // console.log(JSON.stringify(chatHistory.slice(-2), null, 2)); // Xem 2 câu gần nhất

    // --- BẮT ĐẦU ĐOẠN FIX LỊCH SỬ ---
    const chat = model.startChat({
      history: chatHistory.slice(-10),
    });

    // console.log('--- 2. PROMPT GỬI ĐI ---');
    // console.log(inputPrompt);

    // 4. Chuẩn bị dữ liệu gửi cho Google AI
    let promptParts = [inputPrompt];

    if (imageFile) {
      promptParts.push({
        inlineData: {
          data: imageFile.buffer.toString('base64'),
          mimeType: imageFile.mimetype,
        },
      });
    }

    // 5. Cơ chế Retry nếu lỗi 503
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const result = await chat.sendMessage(promptParts);
        const reply = result.response.text();

        // --- MỚI: XỬ LÝ TRUY VẤN DỮ LIỆU (NLP QUERY) ---
        const queryMatch = reply.match(/<query_db>(.*?)<\/query_db>/s);
        if (queryMatch) {
          try {
            const queryData = JSON.parse(queryMatch[1].trim());
            console.log('🔍 AI yêu cầu truy vấn:', queryData);

            let sql = '';
            let params = [currentUserId];

            // // Logic truy vấn linh hoạt
            // if (queryData.type === 'total_spending') {
            //   sql = `
            //     SELECT COALESCE(SUM(amount), 0) as total
            //     FROM transactions t
            //     JOIN accounts a ON t.account_id = a.account_id
            //     WHERE a.user_id = $1 AND EXTRACT(MONTH FROM t.date) = $2
            //     AND t.transaction_type = 'expense'`;
            //   params.push(queryData.month || currentMonth);
            // }

            // if (sql) {
            //   const dbRes = await pool.query(sql, params);
            //   const totalFound = parseFloat(dbRes.rows[0].total).toLocaleString('vi-VN');

            //   // Gửi kết quả thật từ DB lại cho AI để nó trả lời Bảo
            //   const secondResult = await chat.sendMessage(
            //     `[KẾT QUẢ THỰC TẾ TỪ DATABASE]: Tổng cộng là ${totalFound}đ. Hãy trả lời Bảo.`,
            //   );
            //   const finalReply = secondResult.response.text();
            //   return res.json({ reply: finalReply });
            // }

            // 1. Xử lý "Tuần trước" (Last Week)
            if (queryData.time_range === 'last_week') {
              sql = `
                SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
                FROM transactions t JOIN accounts a ON t.account_id = a.account_id
                WHERE a.user_id = $1 
                AND t.date >= date_trunc('week', CURRENT_DATE - INTERVAL '1 week')
                AND t.date < date_trunc('week', CURRENT_DATE)
                AND t.transaction_type = 'expense'`;
            }
            // 2. Xử lý khoảng ngày cụ thể (Ví dụ: 20-24 tháng 3)
            else if (queryData.start_date && queryData.end_date) {
              sql = `
                SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
                FROM transactions t JOIN accounts a ON t.account_id = a.account_id
                WHERE a.user_id = $1 
                AND t.date >= $2 AND t.date <= $3
                AND t.transaction_type = 'expense'`;
              params.push(queryData.start_date, queryData.end_date);
            }
            // 3. Tổng chi tiêu tháng
            else if (queryData.type === 'total_spending') {
              sql = `
                SELECT COALESCE(SUM(amount), 0) as total 
                FROM transactions t JOIN accounts a ON t.account_id = a.account_id
                WHERE a.user_id = $1 AND EXTRACT(MONTH FROM t.date) = $2 
                AND t.transaction_type = 'expense'`;
              params.push(queryData.month || currentMonth);
            }

            if (sql) {
              const dbRes = await pool.query(sql, params);
              const dataFound = dbRes.rows[0];

              // Gửi dữ liệu thật cho AI để nó trả lời Bảo mặn mà hơn
              const secondResult = await chat.sendMessage(
                `[DỮ LIỆU THỰC TẾ]: Bảo đã tiêu ${parseFloat(
                  dataFound.total,
                ).toLocaleString()}đ với ${
                  dataFound.count || 0
                } giao dịch trong khoảng thời gian này. Hãy phân tích và trả lời Bảo.`,
              );
              return res.json({ reply: secondResult.response.text() });
            }
          } catch (e) {
            console.error('❌ Lỗi xử lý Query DB:', e.message);
          }
        }

        // --- MỚI: KIỂM TRA BẤT THƯỜNG TRƯỚC KHI LƯU (ANOMALY) ---
        const transactionMatches = [...reply.matchAll(/<transaction>(.*?)<\/transaction>/gs)];
        if (transactionMatches.length > 0) {
          for (const m of transactionMatches) {
            const data = JSON.parse(m[1].trim());
            const anomaly = await getAnomalyStatus(currentUserId, data.category_name, data.amount);

            if (anomaly.isAnomaly && !message.includes('xác nhận') && !message.includes('Lưu đi')) {
              // Nếu bất thường, yêu cầu AI hỏi lại trước khi lưu
              const warnResult = await chat.sendMessage(
                `[CẢNH BÁO]: Món này cao gấp ${anomaly.factor} lần bình thường. Hãy dừng lại hỏi Bảo xem có nhầm không, KHÔNG được lưu lúc này.`,
              );
              return res.json({ reply: warnResult.response.text() });
            }
          }
        }

        // [LOG 3]: Kiểm tra AI có nhả ra thẻ <transaction> không
        // console.log('--- 3. AI PHẢN HỒI ---');
        // console.log(reply);

        // ==========================================
        // VỊ TRÍ 2: DÁN ĐOẠN LƯU CÂU TRẢ LỜI MONEY GUARD TẠI ĐÂY
        // ==========================================
        try {
          // Trước khi lưu, mình xóa mấy cái thẻ rác đi để DB sạch đẹp
          const cleanMessageForDB = reply
            .replace(/<.*?>[\s\S]*?<\/.*?>/gs, '')
            .replace(/\{[\s\S]*?\}/gs, '')
            .trim();

          await pool.query(
            'INSERT INTO message_history (user_id, role, message) VALUES ($1, $2, $3)',
            [currentUserId, 'model', cleanMessageForDB || 'Money Guard đã xử lý yêu cầu của bạn.'],
          );
          console.log('💾 Đã lưu phản hồi của Money Guard vào DB');
        } catch (err) {
          console.error('❌ Lỗi lưu tin nhắn model:', err.message);
        }
        // ==========================================

        // Lưu vào lịch sử để câu sau Chat còn nhớ
        chatHistory.push({ role: 'user', parts: [{ text: message }] });
        chatHistory.push({ role: 'model', parts: [{ text: reply }] });

        // LOGIC CHỈ TẠO DANH MỤC (Dùng cho yêu cầu thêm danh mục mới) ---
        const createCatMatch = reply.match(/<create_category>(.*?)<\/create_category>/s);
        if (createCatMatch && createCatMatch[1]) {
          try {
            const catData = JSON.parse(createCatMatch[1].trim());
            const catName = catData.category_name;
            const userId = 1;

            if (catName) {
              // Tìm theo cột category_name
              const checkCat = await pool.query(
                'SELECT category_id FROM categories WHERE category_name ILIKE $1 AND user_id = $2',
                [catName, userId],
              );

              if (checkCat.rows.length === 0) {
                // Insert vào cột category_name
                await pool.query(
                  "INSERT INTO categories (user_id, category_name, type, icon, color) VALUES ($1, $2, 'expense', '📁', 'grey')",
                  [userId, catName],
                );
                console.log(`✨ Đã tạo danh mục mới: ${catName}`);
              }
            }
          } catch (e) {
            console.error('❌ Lỗi tạo danh mục:', e.message);
          }
        }

        // 1. XỬ LÝ XÓA GIAO DỊCH QUA CHAT
        const deleteMatch = reply.match(/<delete_transaction>(.*?)<\/delete_transaction>/s);
        if (deleteMatch) {
          const { id } = JSON.parse(deleteMatch[1]);
          await pool.query('DELETE FROM transactions WHERE trans_id = $1', [id]);
          console.log(`🗑️ Đã xóa giao dịch ID: ${id}`);
        }

        // 2. XỬ LÝ CẬP NHẬT GIAO DỊCH QUA CHAT
        const updateMatch = reply.match(/<update_transaction>(.*?)<\/update_transaction>/s);
        if (updateMatch) {
          const { id, amount, description, category_name } = JSON.parse(updateMatch[1]);
          await pool.query(
            'UPDATE transactions SET amount = COALESCE($1, amount), description = COALESCE($2, description) WHERE trans_id = $3',
            [amount, description, id],
          );
          console.log(`✏️ Đã cập nhật giao dịch ID: ${id} thành ${amount}đ`);
        }

        // mới
        // --- LOGIC LƯU VÀO DATABASE POSTGRESQL (ĐÃ FIX NHẬP NHIỀU MÓN) ---

        // 1. Tìm tất cả các thẻ transaction có trong câu trả lời
        const matches = [...reply.matchAll(/<transaction>(.*?)<\/transaction>/gs)];

        // // Tạo một biến bên ngoài app.post để lưu giao dịch cuối cùng
        // let lastSavedTransaction = { time: 0, content: '' };

        if (matches.length > 0) {
          for (const match of matches) {
            try {
              const data = JSON.parse(match[1].trim());
              const userId = 1;
              let catNameFromAI = data.category_name;

              const transactionType = data.transaction_type || 'expense';

              // Làm sạch số tiền và ngày tháng (fix lỗi XX)
              let finalAmount = parseFloat(String(data.amount).replace(/[^0-9.-]+/g, '')) || 0;
              let finalDate = data.date;

              if (!finalDate || finalDate.includes('X')) {
                finalDate = new Date().toISOString().split('T')[0];
              }

              const transactionKey = `${data.description}-${data.amount}-${data.date}`;
              const nowTime = Date.now();

              // Nếu trùng nội dung và thời gian cách nhau chưa tới 5 giây thì bỏ qua
              if (
                lastSavedTransaction.content === transactionKey &&
                nowTime - lastSavedTransaction.time < 5000
              ) {
                console.log('🚫 Chặn lưu trùng giao dịch (Double Submit)');
                continue;
              }

              lastSavedTransaction = { time: nowTime, content: transactionKey };

              // 1. TÌM KIẾM THÔNG MINH:
              // Kiểm tra xem trong DB đã có danh mục nào "chứa" hoặc "giống" cái AI gửi về không
              // Ví dụ: AI gửi "Cơm gà" mà DB đã có "Cơm" -> dùng luôn "Cơm"
              let catRes = await pool.query(
                `SELECT category_id, category_name FROM categories 
                  WHERE (category_name ILIKE $1 OR $1 ILIKE '%' || category_name || '%') 
                  AND user_id = $2 LIMIT 1`,
                [catNameFromAI, userId],
              );

              let categoryId;
              if (catRes.rows.length > 0) {
                categoryId = catRes.rows[0].category_id;
                console.log(
                  `♻️  Gom nhóm: "${catNameFromAI}" vào danh mục sẵn có: "${catRes.rows[0].category_name}"`,
                );
              } else {
                // Nếu tạo danh mục mới, phải tạo đúng loại (income/expense)
                const newCat = await pool.query(
                  "INSERT INTO categories (user_id, category_name, type, icon, color) VALUES ($1, $2, $3, '💰', 'green') RETURNING category_id",
                  [userId, data.category_name, transactionType],
                );
                categoryId = newCat.rows[0].category_id;
                console.log(`✨ Tạo danh mục mới: ${catNameFromAI}`);
              }

              // 2. LƯU GIAO DỊCH
              const insertQuery = `
                INSERT INTO transactions (account_id, category_id, amount, transaction_type, description, date, note)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
              `;
              const values = [
                data.account_id || 1,
                categoryId,
                finalAmount,
                transactionType,
                data.description,
                finalDate,
                data.note || '',
              ];

              await pool.query(insertQuery, values);
              console.log(`✅ Đã lưu ${transactionType}: ${data.description}`);

              // ============================================================
              // GỬI TIN SANG N8N ĐỂ KIỂM TRA HẠN MỨC (CHỈ KHI TIÊU TIỀN)
              // ============================================================
              if (transactionType === 'expense') {
                try {
                  await axios.post(
                    'https://unnibbed-unthrilled-averi.ngrok-free.dev/webhook/money-guard',
                    {
                      userId: currentUserId,
                      transferAmount: finalAmount,
                      transferType: 'out',
                      content: data.description,
                      gateway: 'Chatbot AI',
                    },
                  );
                  console.log('📡 Đã báo cho n8n kiểm tra hạn mức chi tiêu tay.');
                } catch (n8nErr) {
                  console.error('❌ Lỗi gọi n8n:', n8nErr.message);
                }
              }
            } catch (itemErr) {
              console.error('❌ Lỗi lưu món:', itemErr.message);
            }
          }
        }

        // Trả về reply cho client
        return res.json({ reply });
      } catch (err) {
        attempt++;
        if (err.status !== 503 && err.status !== 500) throw err;
        console.log(`Retry ${attempt}/${maxRetries} sau lỗi: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      }
    }

    // Hết retry → trả lỗi thân thiện cho client
    return res.status(503).json({
      error: 'Model đang quá tải (503), thử lại sau vài phút nhé! Hoặc thử model khác.',
    });
  } catch (err) {
    console.error('Gemini error full:', {
      message: err.message,
      status: err.status,
      details: err.response ? await err.response?.text?.() : null,
    });

    let status = err.status || 500;
    let clientMsg = 'Lỗi server AI, thử lại sau nhé';

    if (status === 503 || err.message?.includes('overloaded')) {
      clientMsg = 'Model đang quá tải, chờ chút rồi thử lại (hoặc đổi model)';
    } else if (status === 429) {
      clientMsg = 'Quá giới hạn request, chờ 1 phút nhé';
    } else if (status === 401 || status === 403) {
      clientMsg = 'API key không hợp lệ';
    }

    res.status(status).json({ error: clientMsg });
  }
});

// Health check đơn giản
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI service đang chạy' });
});

// app.listen(PORT, () => {
//   console.log(`🚀 Money Guard Server chạy tại cổng: ${PORT}`);
// });

httpServer.listen(PORT, () => {
  console.log(`🚀 Server và Socket đang chạy tại cổng: ${PORT}`);
});
// KHÔNG ĐƯỢC ghi: app.listen(PORT, 'localhost', ...) vì nó sẽ chặn điện thoại.

// app.listen(PORT, () => {
//   console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
//   console.log(`→ POST /chat với body: { "message": "xin chào" }`);
// });
