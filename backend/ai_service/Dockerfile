FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Cài đặt các công cụ cần thiết cho build (ví dụ: bcrypt cần biên dịch từ source)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt toàn bộ dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

WORKDIR /app/backend/ai_service

# Mở cổng (Dựa vào package.json thấy bạn dùng Express/Socket.io, thường là 3000 hoặc 8080)
EXPOSE 4005

# Lệnh khởi chạy ứng dụng
CMD ["node", "app.js"]