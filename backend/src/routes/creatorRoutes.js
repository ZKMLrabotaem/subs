import { Router } from "express";
import optionalAuth from "../middlewares/optionalAuth.js";
import {getCreator, getTopCreatorsController} from "../controllers/creatorController.js";

const router = Router();
router.get("/top", optionalAuth, getTopCreatorsController);
router.get("/:username", optionalAuth, getCreator);


export default router;
