const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const rabbitMQ = require("../shared/rabbitmq-client");

const express = require("express");
const userRoutes = require("./src/routes/user.routes");
const rabbitMQClient = require("./src/events");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/test-msg", async (req, res) => {
  await rabbitMQ.publish("user.user_create", { message: "Hello from user service!" });
  res.status(200).json({ success: true, message: "Test message published to RabbitMQ" });
})

app.use("/", userRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, async () => {
  await rabbitMQClient.startRabbitMQ();
  console.log(`User service is running on port ${PORT}`);
});
