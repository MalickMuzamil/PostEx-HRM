import { pool } from "../config/db.js";

class RoleActionController {

  // =====================
  // GET role → menu → actions
  // =====================
  static async getRoleMenuActions(req, res) {
    try {
      const { roleId, menuId } = req.params;

      const [menuRows] = await pool.query(
        `SELECT menu_id, menu_name
         FROM menus
         WHERE menu_id = ?
           AND is_active = 1
         LIMIT 1`,
        [menuId]
      );

      if (!menuRows.length) {
        return res.status(404).json({
          status: 404,
          message: "Menu not found"
        });
      }

      const [allActions] = await pool.query(
        `SELECT action_code
         FROM menu_actions
         WHERE is_active = 1`
      );

      const [assigned] = await pool.query(
        `SELECT ma.action_code, rma.is_allowed
         FROM role_menu_actions rma
         JOIN menu_actions ma
           ON ma.action_id = rma.action_id
         WHERE rma.role_id = ?
           AND rma.menu_id = ?`,
        [roleId, menuId]
      );

      const result = {};
      allActions.forEach(a => (result[a.action_code] = false));
      assigned.forEach(a => {
        result[a.action_code] = !!a.is_allowed;
      });

      return res.json({
        status: 200,
        data: {
          menu: menuRows[0].menu_name,
          permissions: result
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

  // =====================
  // SAVE role → menu → actions
  // =====================
  static async saveRoleMenuActions(req, res) {
    try {
      const { roleId, menuId } = req.params;
      const { permissions } = req.body;

      const [menuRows] = await pool.query(
        `SELECT menu_id
         FROM menus
         WHERE menu_id = ?
           AND is_active = 1
         LIMIT 1`,
        [menuId]
      );

      if (!menuRows.length) {
        return res.status(404).json({
          status: 404,
          message: "Menu not found"
        });
      }

      const [actions] = await pool.query(
        `SELECT action_id, action_code
         FROM menu_actions
         WHERE is_active = 1`
      );

      const values = actions.map(a => ([
        roleId,
        menuId,
        a.action_id,
        permissions[a.action_code] === true ? 1 : 0
      ]));

      await pool.query(
        `INSERT INTO role_menu_actions
         (role_id, menu_id, action_id, is_allowed)
         VALUES ?
         ON DUPLICATE KEY UPDATE
         is_allowed = VALUES(is_allowed)`,
        [values]
      );

      res.json({
        status: 200,
        message: "Permissions saved successfully"
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: 500,
        message: "Failed to save permissions"
      });
    }
  }
}

export default RoleActionController;
