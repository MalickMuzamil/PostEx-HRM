import { EmployeeService } from "../services/employee-service.js";

export const EmployeeController = {

    getAll: async (req, res, next) => {
        try {
            const data = await EmployeeService.getAll();
            res.status(200).json({
                status: 200,
                message: "Employees fetched",
                data
            });
        } catch (err) { next(err); }
    },

    create: async (req, res, next) => {
        try {
            const emp_id = await EmployeeService.create(req.body);

            res.status(201).json({
                status: 201,
                message: "Employee saved",
                data: { emp_id }
            });

        } catch (err) { next(err); }
    },

    delete: async (req, res, next) => {
        try {
            await EmployeeService.delete(req.params.emp_id);
            res.status(200).json({
                status: 200,
                message: "Employee Deleted (Soft Delete)"
            });
        } catch (err) { next(err); }
    },

    update: async (req, res, next) => {
        try {
            await EmployeeService.update(req.params.emp_id, req.body);

            res.status(200).json({
                status: 200,
                message: "Employee updated successfully"
            });

        } catch (err) { next(err); }
    },

    getWithoutUser: async (req, res, next) => {
        try {
            const data = await EmployeeService.getWithoutUser();

            res.status(200).json({
                status: 200,
                message: "Employees without user fetched",
                data
            });
        } catch (err) {
            next(err);
        }
    },

};
