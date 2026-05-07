FROM node:20-alpine

WORKDIR /app

COPY ["backend/ai_service/package*.json", "backend/ai_service/"]

RUN apk add --no-cache python3 make g++

RUN cd backend/ai_service && npm install

COPY ["backend/ai_service/", "backend/ai_service/"]

WORKDIR /app/backend/ai_service

EXPOSE 4005

CMD ["node", "app.js"]