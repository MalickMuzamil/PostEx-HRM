import { CombinationService } from "../services/combination-service.js";

export const CombinationController = {

    getByHierarchy: async (req, res, next) => {
        try {
            const data = await CombinationService.getByHierarchy(req.params.fh_id);
            return res.status(200).json({
                status: 200,
                message: "Combinations fetched",
                data
            });
        } catch (err) {
            next(err);
        }
    },

    create: async (req, res, next) => {
        try {
            const { fh_id, path } = req.body;

            const comb_id = await CombinationService.create({
                fh_id,
                items: path   // ← IMPORTANT FIX
            });

            return res.status(201).json({
                status: 201,
                message: "Combination saved",
                data: { comb_id }
            });

        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            const comb_id = req.params.comb_id;
            await CombinationService.delete(comb_id);

            return res.status(200).json({
                status: 200,
                message: "Combination deleted"
            });
        } catch (err) {
            next(err);
        }
    },

    getAll: async (req, res, next) => {
        try {
            const data = await CombinationService.getAll();
            return res.status(200).json({
                status: 200,
                message: "All Combinations fetched",
                data
            });
        } catch (err) {
            next(err);
        }
    },

    update: async (req, res, next) => {
        try {
            const comb_id = req.params.comb_id;
            const { path } = req.body;

            await CombinationService.update(
                comb_id,
                path
            );

            return res.status(200).json({
                status: 200,
                message: "Combination updated"
            });

        } catch (err) {
            next(err);
        }
    }


};
