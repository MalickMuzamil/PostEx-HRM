import { pool } from "../config/db.js";

const AuthorizationService = {

  // =====================
  // GET ALL PERMISSIONS (JWT PAYLOAD)
  // =====================
  async getPermissionsByRole(roleId) {
    const [rows] = await pool.query(`
      SELECT
        m.route AS route,
        GROUP_CONCAT(DISTINCT ma.action_code) AS actions
      FROM role_menu_actions rma
      JOIN menus m
        ON m.menu_id = rma.menu_id
      JOIN role_rights rr
        ON rr.menu_id = m.menu_id
       AND rr.role_id = rma.role_id
       AND rr.is_allowed = 1
       AND rr.is_active = 1
      JOIN menu_actions ma
        ON ma.action_id = rma.action_id
      WHERE rma.role_id = ?
        AND rma.is_allowed = 1
        AND m.is_active = 1
      GROUP BY m.route
    `, [roleId]);

    return rows
      .filter(r => r.route)
      .map(r => ({
        route: r.route.replace(/^\/+/, ''),
        actions: [...new Set(
          r.actions.split(',').map(a => a.toLowerCase())
        )]
      }));
  },

  // =====================
  // CHECK SINGLE PERMISSION (GUARDS / MIDDLEWARE)
  // =====================
  async checkPermission(roleId, route, actionCode) {
    const [rows] = await pool.query(`
      SELECT 1
      FROM role_menu_actions rma
      JOIN menus m
        ON m.menu_id = rma.menu_id
      JOIN role_rights rr
        ON rr.menu_id = m.menu_id
       AND rr.role_id = rma.role_id
       AND rr.is_allowed = 1
       AND rr.is_active = 1
      JOIN menu_actions ma
        ON ma.action_id = rma.action_id
      WHERE rma.role_id = ?
        AND m.route = ?
        AND ma.action_code = ?
        AND rma.is_allowed = 1
        AND m.is_active = 1
      LIMIT 1
    `, [roleId, route, actionCode]);

    return rows.length > 0;
  }

};

export default AuthorizationService;
