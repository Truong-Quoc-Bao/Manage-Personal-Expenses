FROM node:20-alpine

WORKDIR /app

COPY ["backend/shared/rabbitmq-client/package*.json", "backend/shared/rabbitmq-client/"]
COPY ["backend/shared/protos/package*.json", "backend/shared/protos/"]
COPY ["backend/budget_service/package*.json", "backend/budget_service/"]

RUN cd backend/shared/rabbitmq-client && npm install
RUN cd backend/shared/protos && npm install
RUN cd backend/budget_service && npm install

COPY ["backend/shared/rabbitmq-client/", "backend/shared/rabbitmq-client/"]
COPY ["backend/shared/protos/", "backend/shared/protos/"]
COPY ["backend/budget_service/", "backend/budget_service/"]

RUN cd backend/budget_service && npx prisma generate

WORKDIR /app/backend/budget_service

EXPOSE 3008 50053

CMD ["npm", "start"]