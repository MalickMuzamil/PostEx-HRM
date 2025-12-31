import { pool } from "../config/db.js";

export const EntityTypeService = {

  getAll: async () => {
    const [rows] = await pool.query(
      "SELECT * FROM entity_types ORDER BY type_id ASC"
    );
    return rows;
  },

  create: async ({ type_name, shortcode }) => {
    const [result] = await pool.query(
      "INSERT INTO entity_types (type_name, shortcode) VALUES (?, ?)",
      [type_name, shortcode]
    );
    return result.insertId;
  },


  update: async (id, { type_name, shortcode }) => {
    await pool.query(
      "UPDATE entity_types SET type_name=?, shortcode=? WHERE type_id=?",
      [type_name, shortcode, id]
    );
  },

  delete: async (id) => {
    await pool.query("DELETE FROM entity_types WHERE type_id=?", [id]);
  }
};
