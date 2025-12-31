import express from "express";
import { CombinationController } from "../controllers/combination-controller.js";
import AuthMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

// FIX: static route must come FIRST
router.get("/all", AuthMiddleware.authenticate, CombinationController.getAll);
router.get("/:fh_id", AuthMiddleware.authenticate, CombinationController.getByHierarchy);
router.post("/", AuthMiddleware.authenticate, CombinationController.create);
router.delete("/:comb_id", AuthMiddleware.authenticate, CombinationController.delete);
router.put("/:comb_id", AuthMiddleware.authenticate, CombinationController.update);

export default router;

