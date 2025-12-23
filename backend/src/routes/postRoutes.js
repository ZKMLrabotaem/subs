import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import optionalAuth from "../middlewares/optionalAuth.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import {
  create,
  getOne,
  getAll,
  getMine,
  getByUser,
  update,
  remove
} from "../controllers/postController.js";

const router = Router();

router.post("/", authMiddleware, upload.single("media"), create);
router.put("/:id", authMiddleware, upload.single("media"), update);
router.delete("/:id", authMiddleware, remove);

router.get("/", optionalAuth, getAll);
router.get("/mine", authMiddleware, getMine);
router.get("/user/:username", optionalAuth, getByUser);
router.get("/:id", optionalAuth, getOne);

export default router;
