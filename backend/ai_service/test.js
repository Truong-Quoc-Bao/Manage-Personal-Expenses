// API giao dịch gần đây
app.get('/api/recent-transactions', async (req, res) => {
  try {
    const userId = '4f4b144d-e3f8-4e6b-9e32-408030a85698';
    const result = await pool.query(
      `SELECT t.trans_id, t.amount, t.date as created_at, t.transaction_type as type, t.description, c.category_name
         FROM transaction_service.transactions t
         JOIN account_service.accounts a ON t.account_id = a.account_id
         LEFT JOIN category_service.categories c ON t.category_id = c.category_id
         WHERE a.user_id = $1
         ORDER BY t.date DESC LIMIT 20`, // Lấy t.date nguyên bản
      [userId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json([]);
  }
});
