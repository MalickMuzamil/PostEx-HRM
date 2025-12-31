import { EntityTypeService } from "../services/entityType-service.js";

export const EntityTypeController = {

    getAll: async (req, res, next) => {
        try {
            const data = await EntityTypeService.getAll();
            return res.status(200).json({
                status: 200,
                message: "Entity types fetched",
                data,
            });
        } catch (err) {
            next(err);
        }
    },

    create: async (req, res, next) => {
        try {
            const body = {
                type_name: req.body.type_name,
                shortcode: req.body.shortcode
            };

            if (!body.shortcode || body.shortcode.length > 4) {
                return res.status(400).json({
                    status: 400,
                    message: "Shortcode must be 1 to 4 characters only",
                });
            }

            const id = await EntityTypeService.create(body);

            return res.status(201).json({
                status: 201,
                message: "Entity type created successfully",
                data: { id },
            });
        } catch (err) {
            next(err);
        }
    },

    update: async (req, res, next) => {
        try {
            const body = {
                type_name: req.body.type_name,
                shortcode: req.body.shortcode
            };

            // validation
            if (!body.shortcode || body.shortcode.length > 4) {
                return res.status(400).json({
                    status: 400,
                    message: "Shortcode must be 1 to 4 characters only",
                });
            }

            await EntityTypeService.update(req.params.id, body);

            return res.status(200).json({
                status: 200,
                message: "Entity type updated",
            });
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            await EntityTypeService.delete(req.params.id);
            return res.status(200).json({
                status: 200,
                message: "Entity type deleted",
            });
        } catch (err) {
            next(err);
        }
    },
};
