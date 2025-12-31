import RoleService from "../services/role-service.js";

class RoleController {

  async create(req, res) {
    try {
      const role = await RoleService.create(req.body);
      res.status(201).json({
        status: 201,
        message: "Role created successfully",
        data: role
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Failed to create role"
      });
    }
  }

  async getAll(req, res) {
    try {
      const roles = await RoleService.getAll();
      res.status(200).json({
        status: 200,
        data: roles
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Failed to fetch roles"
      });
    }
  }

  async update(req, res) {
    try {
      const { roleId } = req.params;
      const { role_name } = req.body;

      console.log("UPDATE ROLE:", roleId, role_name);

      if (!role_name?.trim()) {
        return res.status(400).json({
          status: 400,
          message: "Role name is required"
        });
      }

      await RoleService.update(roleId, role_name);

      res.status(200).json({
        status: 200,
        message: "Role updated successfully"
      });

    } catch (error) {
      console.error("UPDATE ERROR:", error);
      res.status(500).json({
        status: 500,
        message: "Failed to update role"
      });
    }
  }

  async toggleStatus(req, res) {
    try {
      const { roleId } = req.params;
      const { is_active } = req.body;

      console.log("TOGGLE ROLE:", roleId, is_active);

      await RoleService.toggleStatus(roleId, is_active);

      res.status(200).json({
        status: 200,
        message: "Role status updated"
      });

    } catch (error) {
      console.error("TOGGLE ERROR:", error);
      res.status(500).json({
        status: 500,
        message: "Failed to update role status"
      });
    }
  }
}

export default new RoleController();
