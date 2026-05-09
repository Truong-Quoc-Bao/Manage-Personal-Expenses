const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { CATEGORY_PROTO_PATH } = require('protos');

const GRPC_CATEGORY_HOST = process.env.GRPC_CATEGORY_SERVICE_HOST || 'category-service';
const GRPC_CATEGORY_PORT = process.env.GRPC_CATEGORY_SERVICE_PORT || '50052';

const packageDefinition = protoLoader.loadSync(CATEGORY_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const categoryProto = grpc.loadPackageDefinition(packageDefinition).CategoryProtoService;

let client = null;

function getCategoryClient() {
    if (!client) {
        client = new categoryProto(
            `${GRPC_CATEGORY_HOST}:${GRPC_CATEGORY_PORT}`,
            grpc.credentials.createInsecure()
        );
    }
    return client;
}

function validateCategory({ categoryId, userId, transactionType }) {
    return new Promise((resolve, reject) => {
        getCategoryClient().GetCategoryStatus(
            { category_id: categoryId, user_id: userId, transaction_type: transactionType },
            (err, response) => {
                if (err) return reject(err);
                resolve(response);
            }
        );
    });
}

function getCategoryDisplay({ categoryId, userId, transactionType }) {
    return new Promise((resolve, reject) => {
        getCategoryClient().GetCategoryDisplay(
            { category_id: categoryId, user_id: userId, transaction_type: transactionType },
            (err, response) => {
                if (err) return reject(err);
                resolve(response);
            }
        );
    });
}

module.exports = { validateCategory, getCategoryDisplay };
