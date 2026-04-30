FROM node:20-alpine

WORKDIR /app

COPY ["backend/shared/rabbitmq-client/package*.json", "backend/shared/rabbitmq-client/"]
COPY ["backend/shared/protos/package*.json", "backend/shared/protos/"]
COPY ["backend/category_service/package*.json", "backend/category_service/"]

RUN cd backend/shared/protos && npm install
RUN cd backend/shared/rabbitmq-client && npm install
RUN cd backend/category_service && npm install

COPY ["backend/shared/protos/", "backend/shared/protos/"]
COPY ["backend/shared/rabbitmq-client/", "backend/shared/rabbitmq-client/"]
COPY ["backend/category_service/", "backend/category_service/"]

RUN cd backend/category_service && npx prisma generate

WORKDIR /app/backend/category_service

EXPOSE 3003

CMD ["npm", "start"]