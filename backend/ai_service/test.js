// --- TRONG app.js ---
app.get('/api/ai-deep-scan', authenticateToken, async (req, res) => {
  try {
    // ... code xử lý bên trên giữ nguyên ...
  } catch (err) {
    console.error('🚨 LỖI TẠI SERVER:', err); // Dòng này sẽ hiện lỗi thật ở Terminal

    // SỬA DÒNG NÀY: Trả về JSON để Frontend không bị sập
    res.status(500).json({ error: err.message });
  }
});
