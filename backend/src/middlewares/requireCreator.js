export function requireCreator(req, res, next) {
    if (!req.user?.creatorProfile) {
        return res.status(403).json({
            message: "Только креаторы могут публиковать посты"
        });
    }
    next();
}
