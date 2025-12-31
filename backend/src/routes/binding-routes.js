import express from "express";
import { BindingController } from "../controllers/binding-controller.js";
import AuthMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();


router.get("/", AuthMiddleware.authenticate, BindingController.getAll);
router.post("/", AuthMiddleware.authenticate, BindingController.create);
router.put("/:id", AuthMiddleware.authenticate, BindingController.update);
router.delete("/:id", AuthMiddleware.authenticate, BindingController.delete);

router.get('/:id', BindingController.getById); 

export default router;
