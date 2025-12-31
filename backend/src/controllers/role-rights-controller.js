import { pool } from "../config/db.js";
import RoleRightsService from "../services/role-rights-service.js";

class RoleRightsController {

  /* =====================
     APPLICATIONS
     ===================== */
  async getApplications(req, res) {
    try {
      const [rows] = await pool.query(
        `SELECT app_id, app_name, app_code
         FROM applications
         WHERE is_active = 1`
      );

      res.json({ status: 200, data: rows });
    } catch (e) {
      res.status(500).json({ status: 500, message: "Failed to load applications" });
    }
  }

  /* =====================
     MENUS BY APP
     ===================== */
  async getMenusByApp(req, res) {
    try {
      const { appId } = req.params;

      const [rows] = await pool.query(
        `SELECT * FROM menus
         WHERE app_id = ? AND is_active = 1
         ORDER BY parent_id, menu_id`,
        [appId]
      );

      res.json({ status: 200, data: rows });
    } catch (e) {
      res.status(500).json({ status: 500, message: "Failed to load menus" });
    }
  }

  /* =====================
     ASSIGN RIGHTS
     ===================== */
  /* =====================
   ASSIGN RIGHTS
   ===================== */
  async assign(req, res) {
    const { role_id, app_id, menu_ids, permissions } = req.body;

    // 1️⃣ Assign menus (soft delete + reactivate)
    await RoleRightsService.assignMenus(role_id, app_id, menu_ids || []);

    // 🔥 2️⃣ CLEAN ACTIONS FOR REMOVED MENUS (IMPORTANT)
    await RoleRightsService.cleanupOrphanMenuActions(role_id);

    // 3️⃣ Assign actions for selected menus only
    if (menu_ids?.length && permissions) {
      await RoleRightsService.assignMenuActions(
        role_id,
        menu_ids,
        permissions
      );
    }

    res.json({ status: 200 });
  }



  /* =====================
     GET RIGHTS (UI)
     ===================== */
  async getByRole(req, res) {
    try {
      const { roleId, appId } = req.params;
      const data = await RoleRightsService.getMenusByRole(roleId, appId);
      res.json({ status: 200, data });
    } catch (e) {
      res.status(500).json({ status: 500, message: "Failed to fetch rights" });
    }
  }

  /* =====================
     SIDEBAR
     ===================== */
  async sidebarMenus(req, res) {
    try {
      const roleId = req.user.role_id;
      const data = await RoleRightsService.getMenusForSidebar(roleId);
      res.json({ status: 200, data });
    } catch (e) {
      res.status(500).json({ status: 500, message: "Failed to load sidebar" });
    }
  }

  async getAssigned(req, res) {
    try {
      const data = await RoleRightsService.getAssignedRights();
      res.json({ status: 200, data });
    } catch (e) {
      res.status(500).json({
        status: 500,
        message: "Failed to load assigned rights"
      });
    }
  }

  /* =====================
     DELETE ROLE RIGHTS
     ===================== */
  async deleteAssigned(req, res) {
    try {
      const { roleId, appId } = req.params;

      await RoleRightsService.deleteAssignedRights(roleId, appId);

      res.json({
        status: 200,
        message: "Role rights deleted"
      });
    } catch (e) {
      res.status(500).json({
        status: 500,
        message: "Failed to delete rights"
      });
    }
  }

  async copy(req, res) {
    try {
      const { from_role_id, to_role_id, mode } = req.body;

      if (!from_role_id || !to_role_id) {
        return res.status(400).json({
          status: 400,
          message: "Source and target role required"
        });
      }

      await RoleRightsService.copyRoleRights(
        from_role_id,
        to_role_id,
        mode || "replace"
      );

      res.json({
        status: 200,
        message: "Role rights copied successfully"
      });

    } catch (e) {
      res.status(500).json({
        status: 500,
        message: e.message || "Failed to copy role rights"
      });
    }
  }

  async getRoleActions(req, res) {
    try {
      const { roleId, menuId } = req.params;

      if (!roleId || !menuId) {
        return res.status(400).json({
          status: 400,
          message: "roleId and menuId are required"
        });
      }

      const permissions =
        await RoleRightsService.getMenuActionsByRole(roleId, menuId);

      res.json({
        status: 200,
        data: {
          menu_id: menuId,
          permissions
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: 500,
        message: "Failed to load role actions"
      });
    }
  }
}

export default new RoleRightsController();
