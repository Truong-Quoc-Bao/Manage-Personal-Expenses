FROM node:20-alpine

WORKDIR /app

COPY ["backend/shared/rabbitmq-client/package*.json", "backend/shared/rabbitmq-client/"]
COPY ["backend/user_service/package*.json", "backend/user_service/"]

RUN cd backend/shared/rabbitmq-client && npm install
RUN cd backend/user_service && npm install

COPY ["backend/shared/rabbitmq-client/", "backend/shared/rabbitmq-client/"]
COPY ["backend/user_service/", "backend/user_service/"]

RUN cd backend/user_service && npx prisma generate

WORKDIR /app/backend/user_service
EXPOSE 3001

CMD ["npm", "start"]