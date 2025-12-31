import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { pool } from "./config/db.js";
import { logger } from "./config/logger.js";

import { errorHandler } from "./middleware/errormiddleware.js";

// 🔐 Auth & RBAC
import authRoutes from "./routes/auth-routes.js";
import menuRoutes from "./routes/menu-routes.js";
import roleRoutes from "./routes/role-routes.js";
import roleRightsRoutes from "./routes/role-rights-routes.js";
import roleActionRoutes from "./routes/role-actions.js";
import userRoutes from "./routes/user-routes.js";

// 📦 Existing Modules
import entityTypeRoutes from "./routes/entityType-routes.js";
import nodeRoutes from "./routes/node-routes.js";
import bindingRoutes from "./routes/binding-routes.js";
import combinationRoutes from "./routes/combination-routes.js";
import employeeRoutes from "./routes/employee-routes.js";

import posthog from "./config/posthog.js";

dotenv.config();

const app = express();

// 🌐 Global Middleware
app.use(cors());
app.use(express.json());

// 🔐 Auth Routes
app.use("/auth", authRoutes);

// ⚙️ Configuration → User Management (RBAC)
app.use("/menus", menuRoutes);
app.use("/roles", roleRoutes);
app.use("/role-rights", roleRightsRoutes);
app.use("/role-actions", roleActionRoutes);
app.use("/users", userRoutes);


// 📦 Existing Business Routes
app.use("/entity-types", entityTypeRoutes);
app.use("/nodes", nodeRoutes);
app.use("/bindings", bindingRoutes);
app.use("/combinations", combinationRoutes);
app.use("/employees", employeeRoutes);

// ❗ Central Error Handler (LAST)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await pool.getConnection();
        console.log("✅ MySQL Connected Successfully");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("❌ MySQL Connection Failed", error);
        process.exit(1);
    }
}

startServer();


const shutdown = async () => {
    try {
        console.log("🛑 Shutting down server...");
        await posthog.shutdown(); 
        process.exit(0);
    } catch (err) {
        console.error("Error during shutdown", err);
        process.exit(1);
    }
};

process.on("SIGINT", shutdown);  
process.on("SIGTERM", shutdown);