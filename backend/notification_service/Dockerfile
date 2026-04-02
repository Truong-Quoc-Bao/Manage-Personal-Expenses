FROM node:20-alpine

WORKDIR /app

COPY ["backend/shared/rabbitmq-client/package*.json", "backend/shared/rabbitmq-client/"]
COPY ["backend/notification_service/package*.json", "backend/notification_service/"]

RUN cd backend/shared/rabbitmq-client && npm install
RUN cd backend/notification_service && npm install

COPY ["backend/shared/rabbitmq-client/", "backend/shared/rabbitmq-client/"]
COPY ["backend/notification_service/", "backend/notification_service/"]

WORKDIR /app/backend/notification_service

EXPOSE 3005

CMD ["npm", "start"]