import {getCreatorPage, getTopCreators} from "../services/creatorService.js";

export async function getCreator(req, res) {
    try {
        const currentUserId = req.user?.id ?? null;
        const data = await getCreatorPage(req.params.username, currentUserId);
        res.json(data);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}
export async function getTopCreatorsController(req, res) {
    try {
        const creators = await getTopCreators();
        res.json(creators);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get top creators" });
    }
}
