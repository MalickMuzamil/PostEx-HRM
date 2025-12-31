import express from "express";
import RoleRightsController from "../controllers/role-rights-controller.js";
import AuthMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();


router.get("/applications", AuthMiddleware.authenticate, RoleRightsController.getApplications);
router.get("/menus/:appId", AuthMiddleware.authenticate, RoleRightsController.getMenusByApp);
router.get("/:roleId/:appId", AuthMiddleware.authenticate, RoleRightsController.getByRole);
router.post("/assign", AuthMiddleware.authenticate, RoleRightsController.assign);
router.get("/sidebar", AuthMiddleware.authenticate, RoleRightsController.sidebarMenus);
router.get("/assigned", AuthMiddleware.authenticate, RoleRightsController.getAssigned);
router.delete("/:roleId/:appId", AuthMiddleware.authenticate, RoleRightsController.deleteAssigned);
router.post("/copy", AuthMiddleware.authenticate, RoleRightsController.copy);
router.get("/role-actions/:roleId/:menuId",RoleRightsController.getRoleActions);

export default router;
