import express from "express";
import { EmployeeController } from "../controllers/employee-controller.js";
import AuthMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

// View Employees
router.get(
  "/",
  AuthMiddleware.authenticate,
  // AuthMiddleware.authorize("EMPLOYEES", "VIEW"),
  EmployeeController.getAll
);

// Create Employee
router.post(
  "/",
  AuthMiddleware.authenticate,
  // AuthMiddleware.authorize("EMPLOYEES", "CREATE"),
  EmployeeController.create
);

// Update Employee
router.put(
  "/:emp_id",
  AuthMiddleware.authenticate,
  // AuthMiddleware.authorize("EMPLOYEES", "UPDATE"),
  EmployeeController.update
);

// Delete Employee
router.delete(
  "/:emp_id",
  AuthMiddleware.authenticate,
  // AuthMiddleware.authorize("EMPLOYEES", "DELETE"),
  EmployeeController.delete
);

// Get Employees without User (VIEW permission enough)
router.get(
  "/without-user",
  AuthMiddleware.authenticate,
  // AuthMiddleware.authorize("EMPLOYEES", "VIEW"),
  EmployeeController.getWithoutUser
);

export default router;
