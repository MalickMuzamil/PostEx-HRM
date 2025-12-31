import UserService from "../services/user-service.js";

class UserController {

    async create(req, res) {
        try {
            const user = await UserService.createUser(req.body);
            res.status(201).json({
                status: 201,
                message: "User created successfully",
                data: user
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: error.message || "Failed to create user"
            });
        }
    }

    async getAll(req, res) {
        try {
            const users = await UserService.getAllUsers();
            res.status(200).json({
                status: 200,
                data: users
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Failed to fetch users"
            });
        }
    }

    async update(req, res) {
        try {
            const { userId } = req.params;
            const { role_id, password, effective_from, effective_to } = req.body;

            await UserService.updateUser(userId, {
                role_id,
                password,
                effective_from,
                effective_to
            });

            res.status(200).json({
                status: 200,
                message: "User updated successfully"
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Failed to update user"
            });
        }
    }

    // ✅ REVOKE ACCESS (DELETE USER)
    async delete(req, res) {
        try {
            const { userId } = req.params;

            await UserService.deleteUser(userId);

            res.status(200).json({
                status: 200,
                message: "User access revoked"
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Failed to revoke access"
            });
        }
    }

}

export default new UserController();
