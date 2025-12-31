import AuthorizationService from "../services/authorization-service.js";
import { AuthService } from "../services/auth-service.js";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import posthog from "../config/posthog.js";


export const AuthController = {

    // ✅ LOGIN (already fixed)
    login: async (req, res) => {
        try {
            const { token, user, permissions } =
                await AuthService.login(req.body);

            posthog.identify({
                distinctId: user.user_id.toString(),
                properties: {
                    username: user.full_name,
                    // email: user.email,
                    role_id: user.role_id
                }
            });

            posthog.capture({
                distinctId: user.user_id.toString(),
                event: "user_logged_in"
            });

            res.status(200).json({
                status: 200,
                message: "Login successful",
                data: { token, user }
            });

        } catch (err) {
            res.status(401).json({
                status: 401,
                message: err.message
            });
        }
    },

    // ✅ GET PERMISSIONS (NEW)
    getPermissions: async (req, res) => {
        try {
            const roleId = req.user.role_id;

            const permissions =
                await AuthorizationService.getPermissionsByRole(roleId);

            return res.status(200).json(permissions);

        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: "Failed to load permissions"
            });
        }
    },

    // ✅ UPDATE PASSWORD
    updatePassword: async (req, res) => {
        try {
            const { newPassword } = req.body;
            const userId = req.user.user_id;

            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({
                    status: 400,
                    message: "Password must be at least 6 characters"
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await pool.query(
                `UPDATE users
         SET password = ?, is_password_updated = 1
         WHERE user_id = ?`,
                [hashedPassword, userId]
            );

            return res.status(200).json({
                status: 200,
                message: "Password updated successfully"
            });

        } catch (err) {
            return res.status(500).json({
                status: 500,
                message: "Failed to update password"
            });
        }
    },

    // ✅ VERIFY TOKEN
    verifyToken: async (req, res) => {
        res.status(200).json({
            status: 200,
            message: "Token valid",
            data: req.user
        });
    }
};
