const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const rabbitMQClient = require("./src/events");
const {startGrpcServer} = require("./src/grpc/account.grpc");

const accountRouter = require("./src/routes/account.routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/", accountRouter);

app.use((err, req, res, next) => {
  console.error(err);

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, async () => {
  await rabbitMQClient.startRabbitMQ();
  console.log(`Account service is running on port ${PORT}`);
  startGrpcServer();
});
