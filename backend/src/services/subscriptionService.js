import { addMonths } from "date-fns";
import prisma from "../prisma/prismaClient.js";

export async function subscribeToCreator(userId, creatorId) {
    if (userId === creatorId) {
        throw new Error("Cannot subscribe to yourself");
    }

    const creator = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId }
    });

    if (!creator) throw new Error("User is not a creator");

    let existing = await prisma.subscription.findFirst({
        where: { userId, creatorId, expiresAt: { gte: new Date() } }
    });

    if (existing) {
        if (!existing.autoRenew) {
            existing = await prisma.subscription.update({
                where: { id: existing.id },
                data: { autoRenew: true, canceledAt: null }
            });
            return existing;
        } else {
            throw new Error("Already subscribed");
        }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.balance < Number(creator.subscriptionPrice)) {
        throw new Error("Not enough balance");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: Number(creator.subscriptionPrice) } }
    });

    await prisma.user.update({
        where: { id: creatorId },
        data: { balance: { increment: Number(creator.subscriptionPrice) } }
    });

    const subscription = await prisma.subscription.create({
        data: {
            userId,
            creatorId,
            expiresAt: addMonths(new Date(), 1)
        }
    });

    return subscription;
}

export async function getUserSubscriptions(userId) {
    return prisma.subscription.findMany({
        where: { userId },
        include: { creator: { include: { creatorProfile: true } } }
    });
}

export async function getCreatorSubscribers(creatorId) {
    return prisma.subscription.findMany({
        where: { creatorId, expiresAt: { gte: new Date() } },
        include: { user: true }
    });
}

export async function cancelSubscription(subscriptionId, userId) {
    const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId }
    });

    if (!subscription) throw new Error("Subscription not found");
    if (subscription.userId !== userId) throw new Error("Not allowed");

    return prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
            autoRenew: false,
            canceledAt: new Date()
        }
    });
}


export async function processSubscriptionRenewals() {
    const now = new Date();

    const subs = await prisma.subscription.findMany({
        where: {
            autoRenew: true,
            expiresAt: { lte: now },
            canceledAt: null
        },
        include: {
            user: true,
            creator: { include: { creatorProfile: true } }
        }
    });

    for (const sub of subs) {
        const price = Number(sub.creator.creatorProfile.subscriptionPrice);

        if (sub.user.balance < price) {
            await prisma.subscription.update({
                where: { id: sub.id },
                data: {
                    autoRenew: false,
                    canceledAt: now
                }
            });
            continue;
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: sub.userId },
                data: { balance: { decrement: price } }
            }),
            prisma.user.update({
                where: { id: sub.creatorId },
                data: { balance: { increment: price } }
            }),
            prisma.subscription.update({
                where: { id: sub.id },
                data: { expiresAt: addMonths(sub.expiresAt, 1) }
            })
        ]);
    }
}
