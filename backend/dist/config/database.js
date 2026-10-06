"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
let memoryServer = null;
async function connectDatabase() {
    const uri = env_1.ENV.MONGO_URI;
    try {
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('[Database] Connected successfully to configured MongoDB.');
        return mongoose_1.default;
    }
    catch (err) {
        if (env_1.ENV.MONGO_URI_CONFIGURED || env_1.ENV.NODE_ENV === 'production') {
            console.error('[Database] Could not connect to configured MongoDB. Check MONGO_URI, Atlas network access, and credentials.');
            throw err;
        }
        console.warn('[Database] Local MongoDB is unavailable. Initializing an in-memory fallback; data will not persist.');
        try {
            const { MongoMemoryReplSet } = await Promise.resolve().then(() => __importStar(require('mongodb-memory-server')));
            memoryServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
            const memUri = memoryServer.getUri();
            await mongoose_1.default.connect(memUri);
            console.log(`[Database] Connected successfully to In-Memory MongoDB at ${memUri}`);
            return mongoose_1.default;
        }
        catch (memErr) {
            console.error('[Database] Failed to initialize in-memory MongoDB:', memErr);
            throw memErr;
        }
    }
}
async function disconnectDatabase() {
    await mongoose_1.default.disconnect();
    if (memoryServer) {
        await memoryServer.stop();
    }
}
