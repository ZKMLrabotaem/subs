import {
    getUserProfileById,
    getUserProfileByUsername,
    updateUserProfile,
    becomeCreator
} from "../services/userService.js";

export async function getMe(req, res) {
    const user = await getUserProfileById(req.user.id);
    res.json(user);
}

export async function getByUsername(req, res) {
    const { username } = req.params;
    const user = await getUserProfileByUsername(username);

    if (!user) return res.status(404).json({ message: "User not found" });
    const likes = user.profileVotes.filter(v => v.value === 1).length;
    const dislikes = user.profileVotes.filter(v => v.value === -1).length;

    const myVote = user.profileVotes.find(v => v.userId === user.id)?.value || 0;
    res.json({
        ...user,
        likes,
        dislikes,
        myVote
    });
}

export async function updateMe(req, res) {
    const { username, bio } = req.body;
    const avatarFile = req.file;

    const updateData = { username, bio };

    if (avatarFile) {
        updateData.avatarUrl = avatarFile.location;
    }

    try {
        const user = await updateUserProfile(req.user.id, updateData);
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}



export async function upgradeToCreator(req, res) {
    try {
        const profile = await becomeCreator(req.user.id, req.body.subscriptionPrice);
        res.json(profile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
