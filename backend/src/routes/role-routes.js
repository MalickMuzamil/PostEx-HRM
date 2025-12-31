import express from "express";
import RoleController from "../controllers/role-controller.js";
import AuthMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

// ➕ CREATE ROLE
router.post(
    "/",
    AuthMiddleware.authenticate,
    RoleController.create
);

// 📄 GET ALL ROLES
router.get(
    "/",
    AuthMiddleware.authenticate,
    RoleController.getAll
);

// ✏️ UPDATE ROLE NAME
router.put(
    "/:roleId",
    AuthMiddleware.authenticate,
    RoleController.update
);

// 🔁 ACTIVATE / DEACTIVATE
router.put(
    "/:roleId/status",
    AuthMiddleware.authenticate,
    RoleController.toggleStatus
);

export default router;
