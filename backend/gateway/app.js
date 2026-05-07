const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const app = express();
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const morgan = require("morgan");
const PORT = process.env.PORT;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    // allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(morgan("dev"));

app.use(
  "/api/accounts",
  createProxyMiddleware({
    target: process.env.ACCOUNT_SERVICE_URL,
    changeOrigin: true,
    logLevel: "debug",
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(500).send("Gateway error");
    },
  })
);

app.use(
  "/api/users",
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    logLevel: "debug",
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(500).send("Gateway error");
    },
  })
);

app.use(
  "/api/categories",
  createProxyMiddleware({
    target: process.env.CATEGORY_SERVICE_URL,
    changeOrigin: true,
    logLevel: "debug",
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(500).send("Gateway error");
    },
  })
);

app.use(
  "/api/analytics",
  createProxyMiddleware({
    target: process.env.ANALYTICS_SERVICE_URL,
    changeOrigin: true,
    logLevel: "debug",
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(500).send("Gateway error");
    },
  })
);

app.use(
  "/api/notifications",
  createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL,
    changeOrigin: true,
    logLevel: "debug",
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(500).send("Gateway error");
    },
  })
);

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    logLevel: "debug",
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(500).send("Gateway error");
    },
  })
);

app.use(
  "/api/transactions",
  createProxyMiddleware({
    target: process.env.TRANSACTION_SERVICE_URL,
    changeOrigin: true,
    logLevel: "debug",
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(500).send("Gateway error");
    },
  })
);
app.use(
  "/api/budgets",
  createProxyMiddleware({
    target: process.env.BUDGET_SERVICE_URL,
    changeOrigin: true,
    logLevel: "debug",
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(500).send("Gateway error");
    },
  })
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
