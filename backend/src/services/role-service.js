import { pool } from "../config/db.js";

class RoleService {

  async create({ role_name }) {
    const [result] = await pool.query(
      "INSERT INTO roles (role_name, is_active) VALUES (?, 1)",
      [role_name]
    );
    return { role_id: result.insertId };
  }

  async getAll() {
    const [rows] = await pool.query(
      "SELECT role_id, role_name, is_active FROM roles ORDER BY role_id DESC"
    );
    return rows;
  }

  async update(roleId, role_name) {
    const [result] = await pool.query(
      "UPDATE roles SET role_name = ? WHERE role_id = ?",
      [role_name, roleId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Role not found");
    }
  }

  async toggleStatus(roleId, isActive) {
    const [result] = await pool.query(
      "UPDATE roles SET is_active = ? WHERE role_id = ?",
      [isActive, roleId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Role not found");
    }
  }
}

export default new RoleService();
