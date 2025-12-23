import prisma from "../prisma/prismaClient.js";

export async function vote({ userId, postId, profileId, value }) {
    const where = postId
        ? { userId_postId: { userId, postId } }
        : { userId_profileId: { userId, profileId } };

    const existing = await prisma.vote.findUnique({ where });

    if (!existing) {
        return prisma.vote.create({
            data: { userId, postId, profileId, value }
        });
    }

    if (existing.value === value) {
        return prisma.vote.delete({ where });
    }

    return prisma.vote.update({
        where,
        data: { value }
    });
}
