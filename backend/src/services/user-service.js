import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

class UserService {

    /**
     * CREATE USER (Grant Access)
     */
    async createUser(data) {
        const {
            email,
            password = "12345678",
            role_id,
            effective_from,
            effective_to = null
        } = data;

        const hashedPassword = await bcrypt.hash(password, 10);
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // 1️⃣ Create user
            const [userResult] = await conn.query(
                `INSERT INTO users (email, password, is_active)
             VALUES (?, ?, 1)`,
                [email, hashedPassword]
            );

            const userId = userResult.insertId;

            // 2️⃣ Assign role WITH DATES ✅
            await conn.query(
                `INSERT INTO user_roles 
             (user_id, role_id, effective_from, effective_to)
             VALUES (?, ?, ?, ?)`,
                [userId, role_id, effective_from, effective_to]
            );

            await conn.commit();
            return { user_id: userId };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }


    /**
     * GET USERS WITH ROLES
     */
    async getAllUsers() {
        const [rows] = await pool.query(`
    SELECT
      u.user_id,
      u.email,
      u.is_active,
      r.role_id,
      r.role_name,
      ur.effective_from,
      ur.effective_to,
      CASE
        WHEN ur.user_id IS NULL THEN 'unassigned'
        WHEN ur.effective_to IS NOT NULL AND ur.effective_to < CURDATE()
          THEN 'expired'
        ELSE 'active'
      END AS access_status
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.user_id
    LEFT JOIN roles r ON r.role_id = ur.role_id
    ORDER BY u.user_id DESC
  `);

        return rows;
    }


    /**
     * UPDATE ROLE / PASSWORD (Edit Access)
     */
    async updateUser(userId, { role_id, password, effective_from, effective_to }) {
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // 🔐 Password update (optional)
            if (password) {
                const hashed = await bcrypt.hash(password, 10);
                await conn.query(
                    `UPDATE users SET password = ? WHERE user_id = ?`,
                    [hashed, userId]
                );
            }

            // 🎭 Role + Dates update ✅
            if (role_id) {
                await conn.query(
                    `UPDATE user_roles 
                 SET role_id = ?, effective_from = ?, effective_to = ?
                 WHERE user_id = ?`,
                    [
                        role_id,
                        effective_from,
                        effective_to || null,
                        userId
                    ]
                );
            }

            await conn.commit();
            return true;

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    /**
     * DELETE USER (Revoke Access)
     */
    async deleteUser(userId) {
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            await conn.query(
                `DELETE FROM user_roles WHERE user_id = ?`,
                [userId]
            );

            await conn.query(
                `DELETE FROM users WHERE user_id = ?`,
                [userId]
            );

            await conn.commit();
            return true;

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
}

export default new UserService();
