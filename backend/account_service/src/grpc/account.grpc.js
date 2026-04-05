const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { ACCOUNT_PROTO_PATH } = require('protos');
const ACCOUNT_PROTO_PORT = process.env.GRPC_ACCOUNT_SERVICE_PORT;

const packageDefinition = protoLoader.loadSync(ACCOUNT_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const accountProto = grpc.loadPackageDefinition(packageDefinition).AccountProtoService;

const getAccountStatus = async (call, callback) => {
    try {
        const { account_id, amount_to_check } = call.request;
        
        // const account = await accountService.getAccountById(account_id);

        if (!account) {
            return callback(null, { exists: false, has_enough_balance: false, message: "Account not found" });
        }

        const hasBalance = account.balance >= amount_to_check;
        
        callback(null, {
            exists: true,
            has_enough_balance: hasBalance,
            message: hasBalance ? "Success" : "Insufficient balance"
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
    server.addService(accountProto.service, { getAccountStatus });

    server.bindAsync(`0.0.0.0:${ACCOUNT_PROTO_PORT}`, grpc.ServerCredentials.createInsecure(), (err, ACCOUNT_PROTO_PORT) => {
        if (err) {
            console.error(`Error starting gRPC: ${err.message}`);
            return;
        }
        console.log(`Account gRPC Server running at 0.0.0.0:${ACCOUNT_PROTO_PORT}`);
        server.start();
    });
};

module.exports = startGrpcServer;