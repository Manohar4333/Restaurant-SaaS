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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../constants");
const PaymentSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    subscriptionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subscription' },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    transactionId: { type: String, sparse: true },
    orderId: { type: String },
    paymentProvider: { type: String, enum: Object.values(constants_1.PaymentProvider), default: constants_1.PaymentProvider.RAZORPAY },
    paymentMethod: { type: String, default: 'ONLINE' },
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: Object.values(constants_1.PaymentStatus), default: constants_1.PaymentStatus.CREATED },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
// Compound index for tenant payment history lookup
PaymentSchema.index({ tenantId: 1, createdAt: -1 });
exports.Payment = mongoose_1.default.model('Payment', PaymentSchema);
