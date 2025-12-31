import express from "express";
import { NodeController } from "../controllers/node-controller.js";
// import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

// STATIC ROUTES FIRST
router.get("/", NodeController.getAll);
router.get("/by-type/:type_id", NodeController.getByType);

// CRUD ROUTES (Dynamic AFTER static)
router.post("/", NodeController.create);
router.put("/:id", NodeController.update);
router.delete("/:id", NodeController.delete);

export default router;
