import prisma from "../prisma/prismaClient.js";


export async function addComment(req, res) {
    const comment = await prisma.comment.create({
        data: {
            content: req.body.content,
            postId: Number(req.params.id),
            authorId: req.user.id
        },
        include: {
            author: { select: { id: true, username: true, avatarUrl: true } }
        }
    });

    res.status(201).json(comment);
}

export async function deleteComment(req, res) {
    const comment = await prisma.comment.findUnique({
        where: { id: Number(req.params.id) }
    });

    if (!comment || comment.authorId !== req.user.id) {
        return res.status(403).json({ message: "Not allowed" });
    }

    await prisma.comment.delete({ where: { id: comment.id } });
    res.json({ success: true });
}

export async function getComments(req, res) {
    const comments = await prisma.comment.findMany({
        where: { postId: Number(req.params.id) },
        orderBy: { createdAt: "asc" },
        include: {
            author: { select: { id: true, username: true, avatarUrl: true } }
        }
    });

    res.json(comments);
}
