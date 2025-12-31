import express from "express";
import RoleActionController from "../controllers/role-action-controller.js";
import AuthMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

router.get(
  "/:roleId/:menuId",
  AuthMiddleware.authenticate,
  RoleActionController.getRoleMenuActions
);

router.post(
  "/:roleId/:menuId",
  AuthMiddleware.authenticate,
  RoleActionController.saveRoleMenuActions
);

export default router;
