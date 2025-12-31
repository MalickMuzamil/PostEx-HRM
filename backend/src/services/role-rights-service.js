import { pool } from "../config/db.js";

class RoleRightsService {

  async assignMenus(roleId, appId, menuIds = []) {

    // 🔹 1. SOFT DELETE existing
    await pool.query(
      `UPDATE role_rights
     SET is_active = 0
     WHERE role_id = ? AND app_id = ?`,
      [roleId, appId]
    );

    if (!menuIds.length) return;

    // 🔹 2. Get parents via recursive tree
    const [rows] = await pool.query(
      `
    WITH RECURSIVE menu_tree AS (
      SELECT menu_id, parent_id
      FROM menus
      WHERE menu_id IN (?)

      UNION ALL

      SELECT m.menu_id, m.parent_id
      FROM menus m
      JOIN menu_tree mt ON mt.parent_id = m.menu_id
    )
    SELECT DISTINCT menu_id FROM menu_tree
    `,
      [menuIds]
    );

    const allMenuIds = rows.map(r => r.menu_id);

    const values = allMenuIds.map(id => [
      roleId,
      appId,
      id,
      1,      // is_allowed
      1       // is_active
    ]);

    // 🔹 3. Re-insert / reactivate
    await pool.query(
      `
    INSERT INTO role_rights
      (role_id, app_id, menu_id, is_allowed, is_active)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      is_allowed = 1,
      is_active = 1
    `,
      [values]
    );
  }

  async getMenusByRole(roleId, appId) {
    const [rows] = await pool.query(
      `SELECT menu_id
     FROM role_rights
     WHERE role_id = ?
       AND app_id = ?
       AND is_allowed = 1
       AND is_active = 1`,
      [roleId, appId]
    );

    return rows.map(r => r.menu_id);
  }

  async getMenusForSidebar(roleId) {
    const [rows] = await pool.query(
      `SELECT DISTINCT m.*
     FROM menus m
     JOIN role_rights rr ON rr.menu_id = m.menu_id
     WHERE rr.role_id = ?
       AND rr.is_allowed = 1
       AND rr.is_active = 1
       AND m.is_active = 1
     ORDER BY m.parent_id, m.menu_id`,
      [roleId]
    );
    return rows;
  }


  /* =====================
     ASSIGNED RIGHTS (TABLE)
     ===================== */
  async getAssignedRights() {
    const [rows] = await pool.query(
      `SELECT
      rr.role_id,
      r.role_name,
      rr.app_id,
      a.app_name,
      COUNT(DISTINCT rr.menu_id) AS menu_count
     FROM role_rights rr
     JOIN roles r ON r.role_id = rr.role_id
     JOIN applications a ON a.app_id = rr.app_id
     WHERE rr.is_allowed = 1
       AND rr.is_active = 1
     GROUP BY rr.role_id, rr.app_id`
    );

    return rows;
  }


  /* =====================
     DELETE ROLE RIGHTS
     ===================== */
  async deleteAssignedRights(roleId, appId) {
    await pool.query(
      `UPDATE role_rights
     SET is_active = 0
     WHERE role_id = ? AND app_id = ?`,
      [roleId, appId]
    );

    await this.cleanupOrphanMenuActions(roleId);
  }

  /* =====================
     COPY ROLE RIGHTS
     ===================== */
  async copyRoleRights(fromRoleId, toRoleId, mode = "replace") {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      if (fromRoleId === toRoleId) {
        throw new Error("Source and target roles cannot be same");
      }

      /* ==========================
         1️⃣ CLEAN TARGET ROLE
         ========================== */
      if (mode === "replace") {

        // deactivate menus
        await connection.query(
          `
        UPDATE role_rights
        SET is_active = 0
        WHERE role_id = ?
        `,
          [toRoleId]
        );

        // delete actions
        await connection.query(
          `
        DELETE FROM role_menu_actions
        WHERE role_id = ?
        `,
          [toRoleId]
        );
      }

      /* ==========================
         2️⃣ COPY MENUS (VIEW)
         ========================== */
      await connection.query(
        `
      INSERT INTO role_rights
        (role_id, app_id, menu_id, is_allowed, is_active)
      SELECT ?, rr.app_id, rr.menu_id, rr.is_allowed, 1
      FROM role_rights rr
      WHERE rr.role_id = ?
        AND rr.is_allowed = 1
        AND rr.is_active = 1
      ON DUPLICATE KEY UPDATE
        is_allowed = VALUES(is_allowed),
        is_active = 1
      `,
        [toRoleId, fromRoleId]
      );

      /* ==========================
         3️⃣ COPY LEAF ACTIONS 🔥
         ========================== */
      await connection.query(
        `
      INSERT INTO role_menu_actions
        (role_id, menu_id, action_id, is_allowed)
      SELECT ?, rma.menu_id, rma.action_id, rma.is_allowed
      FROM role_menu_actions rma
      JOIN role_rights rr
        ON rr.role_id = rma.role_id
       AND rr.menu_id = rma.menu_id
       AND rr.is_active = 1
       AND rr.is_allowed = 1
      WHERE rma.role_id = ?
      ON DUPLICATE KEY UPDATE
        is_allowed = VALUES(is_allowed)
      `,
        [toRoleId, fromRoleId]
      );

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }


  async assignMenuActions(roleId, menuIds, permissions) {

    // remove old actions
    await pool.query(
      `DELETE FROM role_menu_actions 
     WHERE role_id = ? AND menu_id IN (?)`,
      [roleId, menuIds]
    );

    const actionMap = {
      view: 1,
      create: 2,
      update: 3,
      delete: 4
    };

    const rows = [];

    menuIds.forEach(menuId => {
      Object.entries(permissions).forEach(([key, allowed]) => {
        rows.push([
          roleId,
          menuId,
          actionMap[key],
          allowed ? 1 : 0
        ]);
      });
    });

    if (rows.length) {
      await pool.query(
        `INSERT INTO role_menu_actions 
       (role_id, menu_id, action_id, is_allowed)
       VALUES ?
       ON DUPLICATE KEY UPDATE is_allowed = VALUES(is_allowed)`,
        [rows]
      );
    }

    // 🔥 IMPORTANT PART 🔥
    // If VIEW = 0 → deactivate menu
    if (!permissions.view) {
      await pool.query(
        `UPDATE role_rights
       SET is_active = 0
       WHERE role_id = ? AND menu_id IN (?)`,
        [roleId, menuIds]
      );
    } else {
      // VIEW = 1 → activate menu
      await pool.query(
        `UPDATE role_rights
       SET is_active = 1, is_allowed = 1
       WHERE role_id = ? AND menu_id IN (?)`,
        [roleId, menuIds]
      );
    }
  }

  async getMenuActionsByRole(roleId, menuId) {
    const [rows] = await pool.query(
      `
      SELECT ma.action_code
    FROM role_menu_actions rma
    JOIN role_rights rr
      ON rr.role_id = rma.role_id
    AND rr.menu_id = rma.menu_id
    AND rr.is_allowed = 1
    AND rr.is_active = 1
    JOIN menu_actions ma
      ON ma.action_id = rma.action_id
    WHERE rma.role_id = ?
      AND rma.menu_id = ?;
      `,
      [roleId, menuId]
    );

    const permissions = {
      view: false,
      create: false,
      update: false,
      delete: false
    };

    rows.forEach(r => {
      const key = r.action_code.toLowerCase();
      if (permissions.hasOwnProperty(key)) {
        permissions[key] = true;
      }
    });

    return permissions;
  }

  async cleanupOrphanMenuActions(roleId) {
    await pool.query(
      `
    DELETE rma
    FROM role_menu_actions rma
    LEFT JOIN role_rights rr
      ON rr.role_id = rma.role_id
     AND rr.menu_id = rma.menu_id
     AND rr.is_allowed = 1
     AND rr.is_active = 1
    WHERE rma.role_id = ?
      AND rr.menu_id IS NULL
    `,
      [roleId]
    );
  }


}

export default new RoleRightsService();
