import express from "express";
import { EntityTypeController } from "../controllers/entityType-controller.js";
// import { AuthMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

// router.get("/", authMiddleware, EntityTypeController.getAll);
// router.post("/", authMiddleware, EntityTypeController.create);
// router.put("/:id", authMiddleware, EntityTypeController.update);
// router.delete("/:id", authMiddleware, EntityTypeController.delete);


router.get("/", EntityTypeController.getAll);
router.post("/", EntityTypeController.create);
router.put("/:id", EntityTypeController.update);
router.delete("/:id", EntityTypeController.delete);

export default router;
