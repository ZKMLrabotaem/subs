import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import creatorRoutes from "./routes/creatorRoutes.js";
import votesRoutes from "./routes/votesRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/creators", creatorRoutes);
app.use("/api/votes", votesRoutes);

app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

export default app;
