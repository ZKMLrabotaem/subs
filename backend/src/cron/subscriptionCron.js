import cron from "node-cron";
import { processSubscriptionRenewals } from "../services/subscriptionService.js";

export function startSubscriptionCron() {
    cron.schedule("0 3 * * *", async () => {
        console.log("[CRON] Processing subscription renewals");
        await processSubscriptionRenewals();
    });
}
