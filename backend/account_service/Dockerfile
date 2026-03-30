FROM node:20-alpine

WORKDIR /app

COPY ["backend/shared/rabbitmq-client/package*.json", "backend/shared/rabbitmq-client/"]
COPY ["backend/account_service/package*.json", "backend/account_service/"]

RUN cd backend/shared/rabbitmq-client && npm install
RUN cd backend/account_service && npm install

COPY ["backend/shared/rabbitmq-client/", "backend/shared/rabbitmq-client/"]
COPY ["backend/account_service/", "backend/account_service/"]

RUN cd backend/account_service && npx prisma generate

WORKDIR /app/backend/account_service

EXPOSE 3002

CMD ["npm", "start"]