import prisma from "../prisma/prismaClient.js";
import { canAccessPost } from "./postAccessService.js";
import { mapPostForUser } from "../utils/postMapper.js";

export async function getCreatorPage(username, currentUserId = null) {
    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            creatorProfile: true
        }
    });

    if (!user || !user.creatorProfile) {
        throw new Error("Creator not found");
    }

    let subscription = null;
    if (currentUserId) {
        subscription = await prisma.subscription.findFirst({
            where: {
                userId: currentUserId,
                creatorId: user.id,
                expiresAt: { gte: new Date() }
            }
        });
    }

    const postsRaw = await prisma.post.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            votes: true
        }
    });

    const posts = [];
    for (const post of postsRaw) {
        const access = await canAccessPost(post, currentUserId);
        posts.push(mapPostForUser(post, currentUserId, access));
    }

    return {
        creator: {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            bannerUrl: user.creatorProfile.bannerUrl,
            subscriptionPrice: user.creatorProfile.subscriptionPrice
        },
        subscription: subscription
            ? {
                id: subscription.id,
                expiresAt: subscription.expiresAt,
                canceledAt: subscription.canceledAt,
                autoRenew: subscription.autoRenew
            }
            : null,
        posts
    };
}

export async function getTopCreators(currentUserId = null, limit = 10) {
    const creators = await prisma.user.findMany({
        where: { creatorProfile: { isNot: null } },
        include: {
            creatorProfile: true,
            _count: {
                select: { subscriptions: true } // подсчёт подписчиков
            }
        },
        orderBy: {
            subscriptions: {
                _count: "desc"
            }
        },
        take: limit
    });

    const result = await Promise.all(
        creators.map(async (creator) => {
            let isSubscribed = false;
            if (currentUserId) {
                const sub = await prisma.subscription.findFirst({
                    where: {
                        userId: currentUserId,
                        creatorId: creator.id,
                        expiresAt: { gte: new Date() }
                    }
                });
                isSubscribed = !!sub;
            }

            return {
                id: creator.id,
                username: creator.username,
                avatarUrl: creator.avatarUrl,
                subscriptionPrice: creator.creatorProfile.subscriptionPrice,
                isSubscribed,
                subscribersCount: creator._count.subscriptions
            };
        })
    );

    return result;
}
