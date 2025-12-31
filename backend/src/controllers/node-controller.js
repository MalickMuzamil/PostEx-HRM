import { NodeService } from "../services/node-service.js";

export const NodeController = {

    getAll: async (req, res, next) => {
        try {
            const data = await NodeService.getAll();
            return res.status(200).json({
                status: 200,
                message: "Nodes fetched",
                data,
            });
        } catch (err) {
            next(err);
        }
    },

    create: async (req, res, next) => {
        try {
            const payload = {
                type_id: req.body.type_id,
                node_name: req.body.node_name,
                shortcode: req.body.shortcode
            };

            if (!payload.shortcode || payload.shortcode.length > 4) {
                return res.status(400).json({
                    status: 400,
                    message: "Shortcode must be 1–4 characters only"
                });
            }

            const id = await NodeService.create(payload);

            return res.status(201).json({
                status: 201,
                message: "Node created successfully",
                data: { id },
            });
        } catch (err) {
            next(err);
        }
    },

    update: async (req, res, next) => {
        try {
            const payload = {
                type_id: req.body.type_id,
                node_name: req.body.node_name,
                shortcode: req.body.shortcode
            };

            // SHORTCODE VALIDATION
            if (!payload.shortcode || payload.shortcode.length > 4) {
                return res.status(400).json({
                    status: 400,
                    message: "Shortcode must be 1–4 characters only"
                });
            }

            await NodeService.update(req.params.id, payload);

            return res.status(200).json({
                status: 200,
                message: "Node updated",
            });
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            await NodeService.delete(req.params.id);

            return res.status(200).json({
                status: 200,
                message: "Node deleted",
            });
        } catch (err) {
            next(err);
        }
    },

    getByType: async (req, res, next) => {
        try {
            const data = await NodeService.getByType(req.params.type_id);
            return res.status(200).json({
                status: 200,
                message: "Nodes fetched",
                data,
            });
        } catch (err) {
            next(err);
        }
    }
};
