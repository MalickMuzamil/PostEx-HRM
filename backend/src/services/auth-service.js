import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import AuthorizationService from "./authorization-service.js";

export const AuthService = {

    login: async ({ email, password }) => {

        const [rows] = await pool.query(`
                SELECT 
                u.user_id,
                COALESCE(e.full_name, u.full_name) AS full_name,
                u.email,
                u.password,
                u.is_password_updated,
                r.role_id, 
                r.role_name
                FROM users u
                LEFT JOIN employees e ON e.email = u.email  
                JOIN user_roles ur ON ur.user_id = u.user_id
                JOIN roles r ON r.role_id = ur.role_id
                WHERE u.email = ?
                AND u.is_active = 1
                LIMIT 1;
                `, [email]);

        if (rows.length === 0) {
            throw new Error("Invalid email or password");
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                role: user.role_name,
                role_id: user.role_id,
                full_name: user.full_name,
                pwd_updated: user.is_password_updated
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const permissions =
            await AuthorizationService.getPermissionsByRole(user.role_id);

        return {
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role_name,
                is_password_updated: user.is_password_updated
            },
            permissions
        };
    }
};
