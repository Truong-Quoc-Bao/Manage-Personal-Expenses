const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// API → port 4005
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:4005',
  changeOrigin: true,
}));

// n8n → port 5678
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5678',
  changeOrigin: true,
}));

app.listen(5679, () => {
  console.log('Proxy chạy tại http://localhost:5679');
});