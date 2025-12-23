import prisma from "../prisma/prismaClient.js";

export async function requirePostOwner(req, res, next) {
    const postId = Number(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== req.user.id) {
        return res.status(403).json({
            message: "Вы не можете редактировать чужой пост"
        });
    }

    req.post = post;
    next();
}
