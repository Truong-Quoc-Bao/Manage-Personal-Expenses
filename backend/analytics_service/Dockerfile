FROM node:20-alpine

WORKDIR /app

COPY ["backend/shared/rabbitmq-client/package*.json", "backend/shared/rabbitmq-client/"]
COPY ["backend/shared/protos/package*.json", "backend/shared/protos/"]
COPY ["backend/analytics_service/package*.json", "backend/analytics_service/"]

RUN cd backend/shared/rabbitmq-client && npm install
RUN cd backend/shared/protos && npm install
RUN cd backend/analytics_service && npm install

COPY ["backend/shared/rabbitmq-client/", "backend/shared/rabbitmq-client/"]
COPY ["backend/shared/protos/", "backend/shared/protos/"]
COPY ["backend/analytics_service/", "backend/analytics_service/"]

WORKDIR /app/backend/analytics_service

EXPOSE 3004

CMD ["npm", "start"]