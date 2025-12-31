import express from "express";
import { AuthController } from "../controllers/auth-controller.js";
import AuthMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

/* =====================
   PUBLIC
   ===================== */
router.post("/login", AuthController.login);

/* =====================
   PROTECTED (AUTH)
   ===================== */
router.get(
    "/verify",
    AuthMiddleware.authenticate,
    AuthController.verifyToken
);

router.post(
    "/update-password",
    AuthMiddleware.authenticate,
    AuthController.updatePassword
);

/* =====================
   RBAC (PERMISSIONS)
   ===================== */
router.get(
    "/permissions",
    AuthMiddleware.authenticate,
    AuthController.getPermissions
);

export default router;
