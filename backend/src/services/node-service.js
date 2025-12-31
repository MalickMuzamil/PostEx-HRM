import { pool } from "../config/db.js";

export const NodeService = {

  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT n.node_id, n.node_name, n.shortcode, e.type_name, e.type_id
      FROM nodes n
      JOIN entity_types e ON n.type_id = e.type_id
      ORDER BY n.node_id DESC
    `);
    return rows;
  },

  create: async ({ type_id, node_name, shortcode }) => {
    const [result] = await pool.query(
      `INSERT INTO nodes (type_id, node_name, shortcode)
       VALUES (?, ?, ?)`,
      [type_id, node_name, shortcode]
    );
    return result.insertId;
  },

  update: async (id, { type_id, node_name, shortcode }) => {
    await pool.query(
      `UPDATE nodes 
       SET type_id=?, node_name=?, shortcode=?
       WHERE node_id=?`,
      [type_id, node_name, shortcode, id]
    );
  },

  delete: async (id) => {
    await pool.query(`DELETE FROM nodes WHERE node_id=?`, [id]);
  },

  getByType: async (type_id) => {
    const [rows] = await pool.query(`
      SELECT n.node_id, n.node_name, n.shortcode, e.type_name
      FROM nodes n
      JOIN entity_types e ON n.type_id = e.type_id
      WHERE n.type_id = ?
    `, [type_id]);

    return rows;
  }
};
