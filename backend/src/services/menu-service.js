import { pool } from "../config/db.js";

class MenuService {

    /**
     * Create menu / submenu
     */
    async create(data) {
        const {
            app_id,
            parent_id = null,
            menu_code,
            menu_name,
            route,
            sequence = 0
        } = data;

        const [result] = await pool.query(
            `INSERT INTO menus
             (app_id, parent_id, menu_code, menu_name, route, sequence, is_active)
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [app_id, parent_id, menu_code, menu_name, route, sequence]
        );

        return { menu_id: result.insertId };
    }

    /**
     * Get all menus (flat)
     */
    async getAll(appId) {
        const [rows] = await pool.query(
            `SELECT *
             FROM menus
             WHERE app_id = ?
               AND is_active = 1
             ORDER BY parent_id, sequence`,
            [appId]
        );

        return rows;
    }

    /**
     * Build menu tree (N-level)
     */
    async getTree(appId) {
        const menus = await this.getAll(appId);

        const map = {};
        const tree = [];

        menus.forEach(menu => {
            map[menu.menu_id] = { ...menu, children: [] };
        });

        menus.forEach(menu => {
            if (menu.parent_id) {
                map[menu.parent_id]?.children.push(map[menu.menu_id]);
            } else {
                tree.push(map[menu.menu_id]);
            }
        });

        return tree;
    }

    /**
     * Soft delete menu
     */
    async deactivate(menuId) {
        await pool.query(
            `UPDATE menus SET is_active = 0 WHERE menu_id = ?`,
            [menuId]
        );
    }
}

export default new MenuService();
