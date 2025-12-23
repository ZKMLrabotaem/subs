import prisma from "../prisma/prismaClient.js";

export async function canAccessPost(post, userId) {
    if (!post.isPaid) return true;

    if (!userId) return false;

    if (post.authorId === userId) return true;

    const subscription = await prisma.subscription.findFirst({
        where: {
            userId,
            creatorId: post.authorId,
            expiresAt: { gte: new Date() }
        }
    });

    return Boolean(subscription);
}
