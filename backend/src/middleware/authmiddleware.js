import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { logger } from "../config/logger.js";
import AuthorizationService from "../services/authorization-service.js";

dotenv.config();

class AuthMiddleware {

    static authenticate(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                status: 401,
                message: "Token missing"
            });
        }

        try {
            const token = authHeader.split(" ")[1];
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        } catch (err) {
            return res.status(401).json({
                status: 401,
                message: "Invalid token"
            });
        }
    }

    /**
     * @param {string} menuCode
     * @param {string} permission
     */
    static authorize(menuCode, permission = "VIEW") {
        return async (req, res, next) => {
            try {
                if (!req.user || !req.user.role_id) {
                    return res.status(401).json({
                        status: 401,
                        message: "Unauthorized"
                    });
                }

                const { role_id } = req.user;

                const allowed =
                    await AuthorizationService.checkPermission(
                        role_id,
                        menuCode,
                        permission
                    );

                if (!allowed) {
                    logger.warn(
                        `RBAC DENIED | role:${role_id} menu:${menuCode} perm:${permission}`
                    );
                    return res.status(403).json({
                        status: 403,
                        message: "Access denied"
                    });
                }

                next();

            } catch (error) {
                logger.error("Authorization error", error);
                return res.status(500).json({
                    status: 500,
                    message: "Authorization failed"
                });
            }
        };
    }
}

export default AuthMiddleware;
