import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
    subscribe,
    mySubscriptions,
    subscribers,
    cancel,
    updateSubscriptionPrice
} from "../controllers/subscriptionController.js";

const router = Router();

router.post("/", authMiddleware, subscribe);
router.get("/me", authMiddleware, mySubscriptions);
router.get("/creator/:creatorId", subscribers);
router.post("/:id/cancel", authMiddleware, cancel);
router.post("/creator/:creatorId/price", authMiddleware, updateSubscriptionPrice);

export default router;
