const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || authHeader === 'Bearer null') {
    console.log('⚠️ Không có token hợp lệ → dùng user_id = 1');
    req.user = { user_id: 1 };
    return next();
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) {
      console.log('❌ Token sai!');
      req.user = { user_id: 1 }; // fallback
      return next();
    }
    req.user = user;
    next();
  });
};
