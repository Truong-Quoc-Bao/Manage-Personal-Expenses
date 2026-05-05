FROM node:20-alpine

WORKDIR /app

# copy đúng package.json của service
COPY backend/ai_service/package*.json ./

# cài tool build
RUN apk add --no-cache python3 make g++

# install dependency
RUN npm install

# copy source code của service
COPY backend/ai_service ./

# mở port
EXPOSE 4005

# chạy app
CMD ["node", "app.js"]