import express from "express";
import MenuController from "../controllers/menu-controller.js";
import AuthMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

/**
 * CREATE MENU
 */
router.post(
    "/",
    AuthMiddleware.authenticate,
    AuthMiddleware.authorize("MENU_MASTER", "CREATE"),
    MenuController.create
);

/**
 * GET ALL MENUS (flat)
 */
router.get("/:app_id",AuthMiddleware.authenticate,AuthMiddleware.authorize("MENU_MASTER", "VIEW"),MenuController.getAll
);

/**
 * GET MENU TREE (N-LEVEL)
 */
router.get("/tree/:app_id",AuthMiddleware.authenticate,AuthMiddleware.authorize("MENU_MASTER", "VIEW"),MenuController.getTree
);

/**
 * DEACTIVATE MENU
 */
router.put("/:menuId/deactivate",AuthMiddleware.authenticate,AuthMiddleware.authorize("MENU_MASTER", "UPDATE"),MenuController.deactivate
);

export default router;
