import { BindingService } from "../services/binding-service.js";

export const BindingController = {

    getAll: async (req, res, next) => {
        try {
            const data = await BindingService.getAll();
            return res.status(200).json({
                status: 200,
                message: "Hierarchies fetched",
                data,
            });
        } catch (err) {
            next(err);
        }
    },

    create: async (req, res, next) => {
        try {
            await BindingService.validate(req.body); // NEW VALIDATION

            const id = await BindingService.create(req.body);

            return res.status(201).json({
                status: 201,
                message: "Hierarchy created successfully",
                data: { fh_id: id },
            });
        } catch (err) {
            next(err);
        }
    },

    update: async (req, res, next) => {
        try {
            await BindingService.validate(req.body, true); // NEW VALIDATION

            await BindingService.update(req.params.id, req.body);

            return res.status(200).json({
                status: 200,
                message: "Hierarchy updated",
            });
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            await BindingService.softDelete(req.params.id);

            return res.status(200).json({
                status: 200,
                message: "Hierarchy soft deleted",
            });
        } catch (err) {
            next(err);
        }
    },

    getById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const data = await BindingService.getById(id);
            return res.status(200).json({
                status: 200,
                message: "Hierarchy fetched",
                data,
            });
        } catch (err) {
            next(err);
        }
    },

};
