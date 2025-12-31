import { pool } from "../config/db.js";

export const BindingService = {

  // VALIDATION FUNCTION
  validate: async (data, isUpdate = false) => {
    const today = new Date().toISOString().split("T")[0];
    const { is_active, effective_from, effective_to, rows } = data;

    if (!is_active && !isUpdate) {
      throw new Error("Inactive hierarchy cannot be created. Only Active or Upcoming allowed.");
    }

    if (!is_active && isUpdate) {
      throw new Error("You cannot deactivate a hierarchy. Only delete is allowed.");
    }

    if (!effective_from) {
      throw new Error("Effective From is required.");
    }

    if (effective_to && effective_to <= today) {
      throw new Error("Effective To must be a future date.");
    }

    if (!rows || rows.length === 0) {
      throw new Error("Hierarchy must contain at least one row.");
    }
  },

  // GET ALL
  getAll: async () => {
    const [heads] = await pool.query(`
    SELECT fh_id, is_active, effective_from, effective_to
    FROM functional_hierarchy
    ORDER BY fh_id DESC
  `);

    for (const h of heads) {
      const [rows] = await pool.query(`
      SELECT 
        r.*, 
        t.type_name, 
        t.shortcode AS type_shortcode,
        n.node_name,
        n.shortcode AS node_shortcode
      FROM functional_hierarchy_rows r
      JOIN entity_types t ON r.type_id = t.type_id
      JOIN nodes n ON r.node_id = n.node_id
      WHERE fh_id = ?
      ORDER BY level_order ASC
    `, [h.fh_id]);

      h.rows = rows;

      // 🔥 SHORTCODE NAME
      h.hierarchy_name = rows
        .map(r => r.type_shortcode || r.type_name)
        .join(" → ");
    }

    return heads;
  },


  create: async ({ is_active, effective_from, effective_to, rows }) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(`
        INSERT INTO functional_hierarchy (is_active, effective_from, effective_to)
        VALUES (?, ?, ?)
      `, [is_active, effective_from, effective_to || null]);

      const fh_id = result.insertId;

      for (const r of rows) {
        await conn.query(`
          INSERT INTO functional_hierarchy_rows 
          (fh_id, level_order, type_id, node_id)
          VALUES (?, ?, ?, ?)
        `, [fh_id, r.level_order, r.type_id, r.node_id]);
      }

      await conn.commit();
      return fh_id;

    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  update: async (fh_id, data) => {
    const { is_active, effective_from, effective_to, rows } = data;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [check] = await conn.query(
        "SELECT fh_id FROM functional_hierarchy WHERE fh_id=?",
        [fh_id]
      );

      if (check.length === 0) {
        throw new Error("Hierarchy not found");
      }

      await conn.query(`
        UPDATE functional_hierarchy 
        SET is_active=?, effective_from=?, effective_to=?
        WHERE fh_id=?
      `, [is_active, effective_from, effective_to || null, fh_id]);

      await conn.query(`DELETE FROM functional_hierarchy_rows WHERE fh_id=?`, [fh_id]);

      for (const r of rows) {
        await conn.query(`
          INSERT INTO functional_hierarchy_rows 
          (fh_id, level_order, type_id, node_id)
          VALUES (?, ?, ?, ?)
        `, [fh_id, r.level_order, r.type_id, r.node_id]);
      }

      await conn.commit();
      return true;

    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  softDelete: async (fh_id) => {
    const [result] = await pool.query(`
      UPDATE functional_hierarchy 
      SET is_active = 0
      WHERE fh_id = ?
    `, [fh_id]);

    if (result.affectedRows === 0) {
      throw new Error("Hierarchy not found");
    }

    return true;
  },

  getById: async (fh_id) => {
    // fetch header
    const [[headRows]] = await pool.query(`
    SELECT fh_id, is_active, effective_from, effective_to
    FROM functional_hierarchy
    WHERE fh_id = ?
  `, [fh_id]);

    if (!headRows) {
      throw new Error("Hierarchy not found");
    }
    const h = headRows;

    // fetch rows
    const [rows] = await pool.query(`
    SELECT r.*, t.type_name, t.shortcode as type_shortcode, n.node_name
    FROM functional_hierarchy_rows r
    JOIN entity_types t ON r.type_id = t.type_id
    JOIN nodes n ON r.node_id = n.node_id
    WHERE r.fh_id = ?
    ORDER BY r.level_order ASC
  `, [fh_id]);

    h.rows = rows || [];
    // generate readable name (Type names joined)
    h.hierarchy_name = (h.rows.length > 0) ? h.rows.map(r => r.type_name).join(" → ") : `H-${h.fh_id}`;

    return h;
  },

};
