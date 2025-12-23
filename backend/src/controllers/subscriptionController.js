import {
    subscribeToCreator,
    getUserSubscriptions,
    getCreatorSubscribers,
    cancelSubscription
} from "../services/subscriptionService.js";
import prisma from "../prisma/prismaClient.js";

export async function subscribe(req, res) {
    try {
        const subscription = await subscribeToCreator(req.user.id, Number(req.body.creatorId));
        res.status(201).json(subscription);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export async function mySubscriptions(req, res) {
    const subscriptions = await getUserSubscriptions(req.user.id);
    res.json(subscriptions);
}

export async function subscribers(req, res) {
    const subs = await getCreatorSubscribers(Number(req.params.creatorId));
    res.json(subs);
}

export async function cancel(req, res) {
    try {
        const sub = await cancelSubscription(
            Number(req.params.id),
            req.user.id
        );
        res.json(sub);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export async function updateSubscriptionPrice(req, res) {
    const { creatorId } = req.params;
    const { newPrice } = req.body;

    if (typeof newPrice !== "number") {
        return res.status(400).json({ message: "Invalid price" });
    }

    if (req.user.id !== Number(creatorId)) {
        return res.status(403).json({ message: "Not allowed" });
    }

    try {
        await prisma.creatorProfile.update({
            where: { userId: Number(creatorId) },
            data: { subscriptionPrice: newPrice }
        });

        await prisma.subscription.updateMany({
            where: { creatorId: Number(creatorId), autoRenew: true },
            data: { autoRenew: false,   canceledAt: new Date() }
        });

        res.json({ message: "Price updated and autoRenew disabled for all subscribers" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
