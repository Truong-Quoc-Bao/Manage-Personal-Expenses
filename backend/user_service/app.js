const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const userRoutes = require("./src/routes/user.routes");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
