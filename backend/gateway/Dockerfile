FROM node:20-alpine

WORKDIR /app

COPY ["backend/shared/rabbitmq-client/package*.json", "backend/shared/rabbitmq-client/"]
COPY ["backend/gateway/package*.json", "backend/gateway/"]

RUN cd backend/shared/rabbitmq-client && npm install
RUN cd backend/gateway && npm install

COPY ["backend/shared/rabbitmq-client/", "backend/shared/rabbitmq-client/"]
COPY ["backend/gateway/", "backend/gateway/"]

WORKDIR /app/backend/gateway

EXPOSE 3000

CMD ["npm", "start"]
