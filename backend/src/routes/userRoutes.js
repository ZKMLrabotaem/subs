import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getMe, getByUsername, updateMe, upgradeToCreator } from "../controllers/userController.js";
import {upload} from "../middlewares/uploadMiddleware.js";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, upload.single("avatar"), updateMe);
router.get("/:username", getByUsername);
router.post("/become-creator", authMiddleware, upgradeToCreator);

export default router;
