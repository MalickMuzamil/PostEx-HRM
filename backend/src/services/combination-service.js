import { pool } from "../config/db.js";

export const CombinationService = {

    // ===============================
    // GET LIST OF COMBINATIONS FOR A HIERARCHY
    // ===============================
    getByHierarchy: async (fh_id) => {
        const [combinations] = await pool.query(`
            SELECT comb_id, fh_id
            FROM hierarchy_combinations
            WHERE fh_id = ?
            ORDER BY comb_id DESC
        `, [fh_id]);

        for (const c of combinations) {
            const [items] = await pool.query(`
                SELECT i.*, t.type_name, n.node_name
                FROM hierarchy_combination_items i
                JOIN entity_types t ON i.type_id = t.type_id
                JOIN nodes n ON i.node_id = n.node_id
                WHERE i.comb_id = ?
                ORDER BY i.level_order ASC
            `, [c.comb_id]);

            c.full_path = items;
        }

        return combinations;
    },

    // ===============================
    // CREATE NEW COMBINATION (FK SAFE)
    // ===============================
    create: async ({ fh_id, items }) => {
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // 1️⃣ create parent row FIRST (must exist before child inserts)
            const [res] = await conn.query(`
                INSERT INTO hierarchy_combinations (fh_id, is_building_path)
                VALUES (?, 1)
            `, [fh_id]);

            const comb_id = res.insertId;

            // 2️⃣ insert all child items
            for (let i = 0; i < items.length; i++) {
                const it = items[i];

                await conn.query(`
                    INSERT INTO hierarchy_combination_items
                    (comb_id, level_order, type_id, node_id)
                    VALUES (?, ?, ?, ?)
                `, [
                    comb_id,
                    i + 1,
                    it.type_id,
                    it.node_id
                ]);
            }

            // 3️⃣ build FINAL path_signature + enable duplicate check (ONE update only)
            await conn.query(`
                UPDATE hierarchy_combinations
                SET
                    path_signature = (
                        SELECT GROUP_CONCAT(
                            CONCAT(type_id, ':', node_id)
                            ORDER BY level_order SEPARATOR '|'
                        )
                        FROM hierarchy_combination_items
                        WHERE comb_id = ?
                    ),
                    is_building_path = 0
                WHERE comb_id = ?
            `, [comb_id, comb_id]);

            await conn.commit();
            return comb_id;

        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    // ===============================
    // DELETE COMBINATION
    // ===============================
    delete: async (comb_id) => {
        comb_id = Number(comb_id);

        await pool.query(`
            DELETE FROM hierarchy_combination_items
            WHERE comb_id = ?
        `, [comb_id]);

        await pool.query(`
            DELETE FROM hierarchy_combinations
            WHERE comb_id = ?
        `, [comb_id]);

        return true;
    },

    // ===============================
    // GET ALL COMBINATIONS
    // ===============================
    getAll: async () => {
        const [combinations] = await pool.query(`
            SELECT comb_id, fh_id
            FROM hierarchy_combinations
            ORDER BY comb_id DESC
        `);

        for (const c of combinations) {
            const [items] = await pool.query(`
                SELECT
                    i.*,
                    t.type_name,
                    t.shortcode,
                    n.node_name
                FROM hierarchy_combination_items i
                JOIN entity_types t ON i.type_id = t.type_id
                JOIN nodes n ON i.node_id = n.node_id
                WHERE i.comb_id = ?
                ORDER BY i.level_order ASC
            `, [c.comb_id]);

            c.full_path = items;
        }

        return combinations;
    },

    // ===============================
    // UPDATE COMBINATION (FK + TRIGGER SAFE)
    // ===============================
    update: async (comb_id, items) => {
        comb_id = Number(comb_id);
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // 1️⃣ disable duplicate checks
            await conn.query(`
                UPDATE hierarchy_combinations
                SET is_building_path = 1
                WHERE comb_id = ?
            `, [comb_id]);

            // 2️⃣ delete old items
            await conn.query(`
                DELETE FROM hierarchy_combination_items
                WHERE comb_id = ?
            `, [comb_id]);

            // 3️⃣ insert new items
            for (let i = 0; i < items.length; i++) {
                const it = items[i];

                await conn.query(`
                    INSERT INTO hierarchy_combination_items
                    (comb_id, level_order, type_id, node_id)
                    VALUES (?, ?, ?, ?)
                `, [
                    comb_id,
                    i + 1,
                    it.type_id,
                    it.node_id
                ]);
            }

            // 4️⃣ set FINAL signature + enable duplicate check
            await conn.query(`
                UPDATE hierarchy_combinations
                SET
                    path_signature = (
                        SELECT GROUP_CONCAT(
                            CONCAT(type_id, ':', node_id)
                            ORDER BY level_order SEPARATOR '|'
                        )
                        FROM hierarchy_combination_items
                        WHERE comb_id = ?
                    ),
                    is_building_path = 0
                WHERE comb_id = ?
            `, [comb_id, comb_id]);

            await conn.commit();
            return true;

        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }
};
