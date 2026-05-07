const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const app = express();
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const authenticate = require('./src/middleware/auth.middleware');
const authenticateAuthService =
    authenticate.authenticationMiddlewareExceptPublicAuthRoutes;
const PORT = process.env.PORT;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    // allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(morgan("dev"));

const proxyOnError = (serviceLabel) => (err, req, res) => {
    console.error(`Proxy error (${serviceLabel}):`, err);
    res.status(500).send('Gateway error');
};

app.use('/api/accounts', authenticate, createProxyMiddleware({
    target: process.env.ACCOUNT_SERVICE_URL,
    changeOrigin: true,
    logLevel: 'debug',
    onError: proxyOnError('accounts'),
}));

app.use('/api/users', authenticate, createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    logLevel: 'debug',
    onError: proxyOnError('users'),
}));

app.use('/api/categories', authenticate, createProxyMiddleware({
    target: process.env.CATEGORY_SERVICE_URL,
    changeOrigin: true,
    logLevel: 'debug',
    onError: proxyOnError('categories'),
}));

app.use('/api/analytics', authenticate, createProxyMiddleware({
    target: process.env.ANALYTICS_SERVICE_URL,
    changeOrigin: true,
    logLevel: 'debug',
    onError: proxyOnError('analytics'),
}));

app.use('/api/notifications', authenticate, createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    logLevel: 'debug',
    onError: proxyOnError('notifications'),
}));

app.use('/api/auth', authenticateAuthService, createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    logLevel: 'debug',
    onError: proxyOnError('auth'),
}));

app.use('/api/transactions', authenticate, createProxyMiddleware({
    target: process.env.TRANSACTION_SERVICE_URL,
    changeOrigin: true,
    logLevel: 'debug',
    onError: proxyOnError('transactions'),
}));

app.use('/api/ai', createProxyMiddleware({
    target: process.env.AI_SERVICE_URL || 'http://localhost:4005',
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/api/ai': '',
    },
    onError: (err, req, res) => {
      console.error('Proxy error (AI Service):', err);
      res.status(500).send('AI Gateway error');
    },
  }),
);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(
    "Transaction service is running on " + process.env.TRANSACTION_SERVICE_URL
  );
  console.log(`Gateway is running on port ${PORT}`);
});
