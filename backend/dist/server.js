"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const socketServer_1 = require("./sockets/socketServer");
const subscriptionChecker_1 = require("./jobs/subscriptionChecker");
const models_1 = require("./models");
const seed_1 = require("./jobs/seed");
async function bootstrap() {
    try {
        // 1. Connect to Database (falls back seamlessly to in-memory if needed)
        await (0, database_1.connectDatabase)();
        // 2. Auto-seed if database is completely empty
        const userCount = await models_1.User.countDocuments();
        if (userCount === 0) {
            console.log('[Bootstrap] No users found. Auto-seeding development database...');
            await (0, seed_1.runSeed)();
        }
        // 3. Create HTTP & Socket.IO server
        const server = http_1.default.createServer(app_1.default);
        (0, socketServer_1.initSocketServer)(server);
        // 4. Start automated background jobs
        (0, subscriptionChecker_1.startSubscriptionJob)();
        // 5. Start listening
        server.listen(env_1.ENV.PORT, () => {
            console.log('====================================================');
            console.log(`🚀 Multi-Tenant Restaurant SaaS Backend Ready`);
            console.log(`🌐 Server URL: http://localhost:${env_1.ENV.PORT}`);
            console.log(`📑 Health Check: http://localhost:${env_1.ENV.PORT}/api/v1/health`);
            console.log(`📚 Swagger Docs: http://localhost:${env_1.ENV.PORT}/api-docs`);
            console.log(`⚡ Socket.IO Ready on port ${env_1.ENV.PORT}`);
            console.log('====================================================');
        });
    }
    catch (error) {
        console.error('Fatal bootstrap error:', error);
        process.exit(1);
    }
}
bootstrap();
