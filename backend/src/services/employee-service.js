import { pool } from "../config/db.js";

export const EmployeeService = {

    // ============================
    // GET ALL EMPLOYEES
    // ============================
    getAll: async () => {

        const [employees] = await pool.query(`
            SELECT *
            FROM employees
            WHERE is_active = 1
            ORDER BY emp_id DESC
        `);

        for (const emp of employees) {

            // FETCH COMBINATION PATH
            const [path] = await pool.query(`
                SELECT t.type_name, n.node_name
                FROM hierarchy_combination_items i
                JOIN entity_types t ON t.type_id = i.type_id
                JOIN nodes n ON n.node_id = i.node_id
                WHERE i.comb_id = ?
                ORDER BY i.level_order ASC
            `, [emp.comb_id]);

            emp.combination_path = path;
        }

        return employees;
    },

    // ============================
    // CREATE EMPLOYEE
    // ============================
    create: async ({
        full_name, email, phone, gender, cnic,
        fh_id, comb_id, department, designation
    }) => {

        // CHECK IF CNIC EXISTS (soft deleted or active)
        const [exists] = await pool.query(`
            SELECT emp_id, is_active 
            FROM employees 
            WHERE cnic = ?
            LIMIT 1
        `, [cnic]);

        if (exists.length > 0) {

            // If deleted → reactivate
            if (exists[0].is_active === 0) {

                await pool.query(`
                    UPDATE employees
                    SET full_name=?, email=?, phone=?, gender=?,
                        fh_id=?, comb_id=?, department=?, designation=?,
                        is_active=1
                    WHERE emp_id=?
                `, [
                    full_name, email, phone, gender,
                    fh_id, comb_id, department, designation,
                    exists[0].emp_id
                ]);

                return exists[0].emp_id;
            }

            throw new Error("CNIC already exists!");
        }

        // Insert new employee
        const [res] = await pool.query(`
            INSERT INTO employees
            (full_name, email, phone, gender, cnic, 
             fh_id, comb_id, department, designation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            full_name, email, phone, gender, cnic,
            fh_id, comb_id, department, designation
        ]);

        return res.insertId;
    },

    // ============================
    // SOFT DELETE EMPLOYEE
    // ============================
    delete: async (emp_id) => {
        await pool.query(`
            UPDATE employees
            SET is_active = 0
            WHERE emp_id = ?
        `, [emp_id]);

        return true;
    },

    // ============================
    // UPDATE EMPLOYEE
    // ============================
    update: async (emp_id, {
        full_name, email, phone, gender, cnic,
        fh_id, comb_id, department, designation
    }) => {

        // Check if CNIC belongs to someone else
        const [exists] = await pool.query(
            `SELECT emp_id FROM employees WHERE cnic = ? AND emp_id != ?`,
            [cnic, emp_id]
        );

        if (exists.length > 0) {
            throw new Error("CNIC already exists for another employee!");
        }

        await pool.query(`
        UPDATE employees
        SET 
            full_name = ?, 
            email = ?, 
            phone = ?, 
            gender = ?, 
            cnic = ?, 
            fh_id = ?, 
            comb_id = ?, 
            department = ?, 
            designation = ?
        WHERE emp_id = ?
    `, [
            full_name, email, phone, gender, cnic,
            fh_id, comb_id, department, designation,
            emp_id
        ]);

        return true;
    },

    getWithoutUser: async () => {
        const [employees] = await pool.query(`
        SELECT e.emp_id, e.full_name, e.email
        FROM employees e
        LEFT JOIN users u ON u.emp_id = e.emp_id
        WHERE e.is_active = 1
          AND u.user_id IS NULL
        ORDER BY e.emp_id DESC
    `);

        return employees;
    },

};
