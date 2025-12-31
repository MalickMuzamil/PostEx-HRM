import express from "express";
import UserController from "../controllers/user-controller.js";
import AuthMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", AuthMiddleware.authenticate, UserController.create);
router.get("/", AuthMiddleware.authenticate, UserController.getAll);
router.put("/:userId", AuthMiddleware.authenticate, UserController.update);
router.delete("/:userId", AuthMiddleware.authenticate, UserController.delete);

export default router;
