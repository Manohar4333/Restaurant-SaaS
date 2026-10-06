"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSubscriptionJob = startSubscriptionJob;
const node_cron_1 = __importDefault(require("node-cron"));
const subscription_service_1 = require("../services/subscription.service");
function startSubscriptionJob() {
    // Run once every hour at minute 0 (0 * * * *)
    node_cron_1.default.schedule('0 * * * *', async () => {
        try {
            await subscription_service_1.SubscriptionService.checkSubscriptionStatuses();
        }
        catch (err) {
            console.error('[SubscriptionJob] Error running automated check:', err);
        }
    });
    console.log('[Cron] Subscription evaluator job scheduled (runs hourly).');
}
