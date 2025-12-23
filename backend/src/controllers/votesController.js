import {vote} from "../services/votesService.js";
import prisma from "../prisma/prismaClient.js";

export async function votePost(req, res) {
    const { value } = req.body;

    const result = await vote({
        userId: req.user.id,
        postId: Number(req.params.id),
        value
    });

    res.json(result);
}

export async function voteProfile(req, res) {
    try {
        const profileId = Number(req.params.id);
        const value = Number(req.body.value);

        if (![1, -1].includes(value)) {
            return res.status(400).json({ message: "Invalid vote value" });
        }

        await vote({
            userId: req.user.id,
            profileId,
            value
        });

        const votes = await prisma.vote.findMany({
            where: { profileId }
        });

        const likes = votes.filter(v => v.value === 1).length;
        const dislikes = votes.filter(v => v.value === -1).length;
        const myVote = votes.find(v => v.userId === req.user.id)?.value || 0;

        res.json({ likes, dislikes, myVote });

    } catch (err) {
        console.error("VoteProfile error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}
