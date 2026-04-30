const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { ACCOUNT_PROTO_PATH } = require('protos');
const ACCOUNT_PROTO_PORT = process.env.GRPC_ACCOUNT_SERVICE_PORT;
const accountService = require('../services/account.service');

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
        const { account_id, user_id } = call.request;
        console.log(`Received gRPC request for account_id: ${account_id}, user_id: ${user_id}`);
        
        const exists = await accountService.checkExistAccount(account_id, user_id);
        
        callback(null, {
            exists: exists,
            message: exists ? "Account exists" : "Account not found"
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

module.exports = {startGrpcServer};