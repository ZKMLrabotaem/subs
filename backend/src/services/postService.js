import prisma from "../prisma/prismaClient.js";
import { canAccessPost } from "./postAccessService.js";
import { mapPostForUser } from "../utils/postMapper.js";
import s3 from "../utils/s3Client.js";

const bucketName = "media";

export async function deleteFileFromS3(fileUrl) {
    if (!fileUrl) return;

    try {
        const urlParts = fileUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];

        await new Promise((resolve, reject) => {
            s3.deleteObject({ Bucket: "media", Key: fileName }, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });

        console.log("Deleted file from S3:", fileName);
    } catch (err) {
        console.error("Error deleting file from S3:", err);
    }
}

export async function createPost(authorId, data, file) {
    if (!authorId) {
        throw new Error(`Только креаторы могут публиковать посты`);
    }
    return prisma.post.create({
        data: {
            authorId,
            title: data.title,
            content: data.content,
            previewText: data.previewText || null,
            mediaUrl: file?.location || null,
            isPaid: data.isPaid === "true" || false
        }
    });
}

export async function updatePost(postId, authorId, data, file) {
    const post = await prisma.post.findUnique({ where: { id: Number(postId) } });
    if (!post) throw new Error("Post not found");
    if (post.authorId !== authorId) throw new Error("Not authorized");

    if (file && post.mediaUrl) await deleteFileFromS3(post.mediaUrl);

    return prisma.post.update({
        where: { id: Number(postId) },
        data: {
            title: data.title ?? post.title,
            content: data.content ?? post.content,
            previewText: data.previewText ?? post.previewText,
            mediaUrl: file?.location || post.mediaUrl,
            isPaid: data.isPaid === "true" ?? post.isPaid
        }
    });
}

export async function deletePost(postId, authorId) {
    const post = await prisma.post.findUnique({ where: { id: Number(postId) } });
    if (!post) throw new Error("Post not found");
    if (post.authorId !== authorId) throw new Error("Not authorized");

    if (post.mediaUrl) await deleteFileFromS3(post.mediaUrl);

    return prisma.post.delete({ where: { id: Number(postId) } });
}

export async function getPostById(id) {
    return prisma.post.findUnique({
        where: { id: Number(id) },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true
                }
            },
            votes: true
        }
    });
}

export async function getAllPosts({ skip, take, q, sort, access, authorUsername, userId }) {
    const where = {};
    if (q) {
        where.OR = [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
            { author: { username: { contains: q, mode: "insensitive" } } }
        ];
    }
    if (access === "free") where.isPaid = false;
    if (authorUsername) {
        const author = await prisma.user.findUnique({ where: { username: authorUsername } });
        if (!author) return { data: [], total: 0 };
        where.authorId = author.id;
    }

    const total = await prisma.post.count({ where });

    const orderBy =
        sort === "new" ? { createdAt: "desc" } :
            sort === "old" ? { createdAt: "asc" } :
                sort === "popular" ? { likesCount: "desc" } :
                    { createdAt: "desc" };

    const rawPosts = await prisma.post.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
            author: {
                select: { id: true, username: true, avatarUrl: true }
            },
            votes: true
        }
    });

    const data = [];
    for (const post of rawPosts) {
        const access = await canAccessPost(post, userId);
        data.push(mapPostForUser(post, userId, access));
    }

    return { data, total };
}


export async function getPostsByAuthorId(authorId, { skip = 0, take = 20 } = {}) {
    return prisma.post.findMany({
        where: { authorId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true
                }
            },
            votes: true
        }
    });
}

export async function getPostsByUsername(username, { skip = 0, take = 20 } = {}) {
    const user = await prisma.user.findUnique({
        where: { username }
    });

    if (!user) throw new Error("User not found");

    return prisma.post.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true
                }
            },
            votes: true
        }
    });
}
