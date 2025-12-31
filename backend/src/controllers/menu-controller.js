import MenuService from "../services/menu-service.js";

class MenuController {

    async create(req, res) {
        try {
            const menu = await MenuService.create(req.body);
            res.status(201).json({
                status: 201,
                message: "Menu created",
                data: menu
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Failed to create menu"
            });
        }
    }

    async getAll(req, res) {
        try {
            const { app_id } = req.params;
            const menus = await MenuService.getAll(app_id);
            res.status(200).json({ status: 200, data: menus });
        } catch (error) {
            res.status(500).json({ status: 500, message: "Failed to fetch menus" });
        }
    }

    async getTree(req, res) {
        try {
            const { app_id } = req.params;
            const tree = await MenuService.getTree(app_id);
            res.status(200).json({ status: 200, data: tree });
        } catch (error) {
            res.status(500).json({ status: 500, message: "Failed to fetch menu tree" });
        }
    }

    async deactivate(req, res) {
        try {
            await MenuService.deactivate(req.params.menuId);
            res.status(200).json({
                status: 200,
                message: "Menu deactivated"
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Failed to deactivate menu"
            });
        }
    }
}

export default new MenuController();
