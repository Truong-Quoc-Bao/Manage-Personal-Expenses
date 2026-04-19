// --- TRONG app.post('/chat', ...) ---

// 1. Lấy tổng ngân sách mà Bảo đã cài đặt cho tháng này
const budgetRes = await pool.query(
  `
  SELECT COALESCE(SUM(amount_limit), 0) as total_limit
  FROM budgets
  WHERE user_id = $1 AND month = $2 AND year = $3
`,
  [currentUserId, currentMonth, currentYear],
);

const totalLimit = parseFloat(budgetRes.rows[0].total_limit);

// 2. Tính toán các con số thực tế
// stats.expense Bảo đã có từ query trước đó rồi nhé
const remainingBudget = totalLimit - totalExpense;
const dailyAllowance = daysLeft > 0 ? Math.round(remainingBudget / daysLeft) : 0;

// 3. Đưa vào inputPrompt cho Gemini "soi"
const inputPrompt = `
    [DỮ LIỆU NGÂN SÁCH THỰC TẾ TỪ CSDL]:
    - Tổng ngân sách Bảo tự đặt (Budget): ${totalLimit.toLocaleString()}đ.
    - Bảo đã tiêu hết: ${totalExpense.toLocaleString()}đ.
    - Quỹ còn lại ĐƯỢC PHÉP TIÊU: ${remainingBudget.toLocaleString()}đ.
    - Số ngày còn lại của tháng: ${daysLeft} ngày.
    - Hạn mức chi tiêu mỗi ngày KHÔNG ĐƯỢC VƯỢT QUÁ: ${dailyAllowance.toLocaleString()}đ.

    [CHỈ THỊ CỰC GẮT CHO AI]:
    1. Nếu "Quỹ còn lại" bị âm: Hãy mắng Bảo là 'Chiến thần phá gia chi tử' và yêu cầu dừng mọi khoản chi.
    2. Khi Người dùng hỏi 'Mua gì tự thưởng', hãy nhìn vào 'Hạn mức chi tiêu mỗi ngày' (${dailyAllowance}đ). 
    3. Tuyệt đối KHÔNG ĐƯỢC lấy số dư tài khoản (${
      stats.balance
    }) để khuyên Bảo tiêu xài. Phải giữ kỷ luật theo Ngân sách (Budget).
`;
