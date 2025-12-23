import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {addComment, deleteComment, getComments} from "../services/commentsService.js";
import {votePost, voteProfile} from "../controllers/votesController.js";

const router = Router();

router.post("/posts/:id/vote", authMiddleware, votePost);
router.post("/profiles/:id/vote", authMiddleware, voteProfile);

router.get("/posts/:id/comments", getComments);
router.post("/posts/:id/comments", authMiddleware, addComment);
router.delete("/comments/:id", authMiddleware, deleteComment);

export default router;
