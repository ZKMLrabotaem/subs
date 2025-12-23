import {
    createPost,
    getPostById,
    getPostsByAuthorId,
    getPostsByUsername,
    getAllPosts,
    updatePost,
    deletePost
} from "../services/postService.js";
import {mapPostForUser} from "../utils/postMapper.js";
import {canAccessPost} from "../services/postAccessService.js";

export async function create(req, res) {
    try {
        const post = await createPost(req.user.id, req.body, req.file, req.user);
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export async function getOne(req, res) {
    try {
        const post = await getPostById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const userId = req.user?.id ?? null;
        const access = await canAccessPost(post, userId);

        res.json(mapPostForUser(post, userId, access));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export async function getMine(req, res) {
    try {
        const posts = await getPostsByAuthorId(req.user.id);
        res.json(posts);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export async function getByUser(req, res) {
    try {
        const userId = req.user?.id ?? null;
        const posts = await getPostsByUsername(req.params.username);

        const result = [];
        for (const post of posts) {
            const access = await canAccessPost(post, userId);
            result.push(mapPostForUser(post, userId, access));
        }

        res.json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

export async function getAll(req, res) {
    try {
        const { skip = 0, take = 10, q, sort, access, authorUsername } = req.query;
        const posts = await getAllPosts({
            skip: Number(skip),
            take: Number(take),
            q,
            sort,
            access,
            authorUsername,
            userId: req.user?.id
        });
        res.json(posts);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}


export async function update(req, res) {
    try {
        const post = await updatePost(req.params.id, req.user.id, req.body, req.file);
        res.json(post);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export async function remove(req, res) {
    try {
        await deletePost(req.params.id, req.user.id);
        res.json({ message: "Post deleted" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
