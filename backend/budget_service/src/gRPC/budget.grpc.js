const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { BUDGET_PROTO_PATH } = require('protos');
const BUDGET_PROTO_PORT = process.env.GRPC_BUDGET_SERVICE_PORT;
const budgetService = require('../services/budget.service');

const packageDefinition = protoLoader.loadSync(BUDGET_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const budgetProto = grpc.loadPackageDefinition(packageDefinition).BudgetProtoService;

const getBudgetStatus = async (call, callback) => {
    try {
        const { budget_id, user_id } = call.request;
        console.log(`Received gRPC request for budget_id: ${budget_id}, user_id: ${user_id}`);

        const budget = await budgetService.getBudgetByBudgetIdService({
            userId: user_id,
            budgetId: budget_id,
        });

        const exists = !!budget;

        callback(null, {
            exists: exists,
            message: exists ? "Budget exists" : "Budget not found"
        });
    } catch (error) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message
        });
    }
};

const startGrpcServer = () => {
    const server = new grpc.Server();
    server.addService(budgetProto.service, { getBudgetStatus });

    server.bindAsync(`0.0.0.0:${BUDGET_PROTO_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error(`Error starting gRPC: ${err.message}`);
            return;
        }
        console.log(`Budget gRPC Server running at 0.0.0.0:${port}`);
        server.start();
    });
};

module.exports = { startGrpcServer };