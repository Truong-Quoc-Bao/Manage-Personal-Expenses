// analytics_service/src/grpc/grpc.client.js

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { ACCOUNT_PROTO_PATH, CATEGORY_PROTO_PATH, BUDGET_PROTO_PATH, ANALYTICS_PROTO_PATH } = require('protos');

const ANALYTICS_PROTO_PORT = process.env.GRPC_ANALYTICS_SERVICE_PORT;

const service = require('../services/analytics.service');


const GRPC_OPTIONS = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

// ─── Load proto definitions ───────────────────────────────────────────────────

const accountProto   = grpc.loadPackageDefinition(protoLoader.loadSync(ACCOUNT_PROTO_PATH,   GRPC_OPTIONS)).AccountProtoService;
const categoryProto  = grpc.loadPackageDefinition(protoLoader.loadSync(CATEGORY_PROTO_PATH,  GRPC_OPTIONS)).CategoryProtoService;
const budgetProto    = grpc.loadPackageDefinition(protoLoader.loadSync(BUDGET_PROTO_PATH,    GRPC_OPTIONS)).BudgetProtoService;
const analyticsProto = grpc.loadPackageDefinition(protoLoader.loadSync(ANALYTICS_PROTO_PATH, GRPC_OPTIONS)).AnalyticsProtoService;

// ─── Khởi tạo clients ─────────────────────────────────────────────────────────

const accountClient = new accountProto(
    `${process.env.GRPC_ACCOUNT_SERVICE_HOST || 'localhost'}:${process.env.GRPC_ACCOUNT_SERVICE_PORT}`,
    grpc.credentials.createInsecure()
);

const categoryClient = new categoryProto(
    `${process.env.GRPC_CATEGORY_SERVICE_HOST || 'localhost'}:${process.env.GRPC_CATEGORY_SERVICE_PORT}`,
    grpc.credentials.createInsecure()
);

const budgetClient = new budgetProto(
    `${process.env.GRPC_BUDGET_SERVICE_HOST || 'localhost'}:${process.env.GRPC_BUDGET_SERVICE_PORT}`,
    grpc.credentials.createInsecure()
);

// ─── Helper: callback → Promise ───────────────────────────────────────────────

const grpcCall = (client, method, payload) =>
    new Promise((resolve, reject) => {
        client[method](payload, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });

// ─── Các hàm gọi từng service ─────────────────────────────────────────────────

/**
 * Gọi account_service → account.grpc.js → getAccountStatus
 * @returns {{ exists: boolean, message: string }}
 */
const getAccountStatus = (account_id, user_id) =>
    grpcCall(accountClient, 'getAccountStatus', { account_id, user_id });

/**
 * Gọi category_service → category.grpc.js → getCategoryStatus
 * @param {string} transaction_type  "income" | "expense"
 * @returns {{ valid: boolean, message: string }}
 */
const getCategoryStatus = (category_id, user_id, transaction_type) =>
    grpcCall(categoryClient, 'getCategoryStatus', { category_id, user_id, transaction_type });

/**
 * Gọi budget_service → budget.grpc.js → getBudgetStatus
 * @returns {{ exists: boolean, message: string }}
 */
const getBudgetStatus = (budget_id, user_id) =>
    grpcCall(budgetClient, 'getBudgetStatus', { budget_id, user_id });

/**
 * Validate account + category (+ budget nếu có) trước khi xử lý transaction.
 * Gọi song song bằng Promise.all.
 * budget_id là OPTIONAL.
 *
 * @throws Error nếu bất kỳ service nào trả về không hợp lệ
 */
const validateTransactionContext = async ({ account_id, category_id, user_id, transaction_type, budget_id }) => {
    const tasks = [
        getAccountStatus(account_id, user_id),
        getCategoryStatus(category_id, user_id, transaction_type),
    ];

    if (budget_id) tasks.push(getBudgetStatus(budget_id, user_id));

    const [accountRes, categoryRes, budgetRes] = await Promise.all(tasks);

    if (!accountRes.exists)                          throw new Error(`Account không hợp lệ: ${accountRes.message}`);
    if (!categoryRes.valid)                          throw new Error(`Category không hợp lệ: ${categoryRes.message}`);
    if (budget_id && budgetRes && !budgetRes.exists) throw new Error(`Budget không tồn tại: ${budgetRes.message}`);

    return { accountRes, categoryRes, budgetRes: budgetRes || null };
};

// ─── gRPC Server handlers ─────────────────────────────────────────────────────

const getAnalyticsSummary = async (call, callback) => {
    try {
        const { user_id, from_date, to_date } = call.request;
        console.log(`Received gRPC request for user_id: ${user_id}`);

        const result = await service.getAnalyticsSummary(user_id, from_date, to_date);

        callback(null, result);
    } catch (error) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message,
        });
    }
};

// ─── Khởi động gRPC Server ────────────────────────────────────────────────────

const startGrpcServer = () => {
    const server = new grpc.Server();
    server.addService(analyticsProto.service, { getAnalyticsSummary });

    server.bindAsync(`0.0.0.0:${ANALYTICS_PROTO_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error(`Error starting gRPC: ${err.message}`);
            return;
        }
        console.log(`Analytics gRPC Server running at 0.0.0.0:${port}`);
        server.start();
    });
};

module.exports = {
    getAccountStatus,
    getCategoryStatus,
    getBudgetStatus,
    validateTransactionContext,
    startGrpcServer,
};