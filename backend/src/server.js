import app from "./app.js";
import { startSubscriptionCron } from "./cron/subscriptionCron.js";
import { initMinio } from "./utils/initMinio.js";

const PORT = process.env.PORT || 5000;
await initMinio();

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);

    startSubscriptionCron();
});
