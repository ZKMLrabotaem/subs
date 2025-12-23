import prisma from "../prisma/prismaClient.js";

export async function getUserProfileById(userId) {
    return prisma.user.findUnique({
        where: { id: userId },
        include: { creatorProfile: true }
    });
}

export async function getUserProfileByUsername(username) {
    return prisma.user.findUnique({
        where: { username },
        include: { creatorProfile: true,
            profileVotes: true }
    });
}

export async function updateUserProfile(userId, data) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            username: data.username,
            bio: data.bio,
            avatarUrl: data.avatarUrl || undefined
        },
    });
}


export async function becomeCreator(userId, subscriptionPrice = 5.0) {
    const existingProfile = await prisma.creatorProfile.findUnique({
        where: { userId }
    });

    if (existingProfile) {
        throw new Error("Already a creator");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: "CREATOR" }
    });

    return prisma.creatorProfile.create({
        data: {
            userId,
            subscriptionPrice
        }
    });
}
