import bcrypt from "bcryptjs";
import { pool } from "../src/config/db.js";

const resetSuperAdmin = async () => {
  const newPassword = "superadmin123";

  const [[admin]] = await pool.query(`
    SELECT u.user_id, u.email
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.user_id
    JOIN roles r ON r.role_id = ur.role_id
    WHERE r.role_name = 'SuperAdmin'
    LIMIT 1
  `);

  if (!admin) {
    console.log("❌ SuperAdmin user not found");
    process.exit(1);
  }

  // 2️⃣ password hash
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 3️⃣ password update
  await pool.query(
    `UPDATE users
     SET password = ?, is_active = 1, is_password_updated = 1
     WHERE user_id = ?`,
    [hashedPassword, admin.user_id]
  );

  console.log("✅ SuperAdmin password reset successfully");
  console.log("👤 User ID:", admin.user_id);
  console.log("📧 Email:", admin.email);
  console.log("🔑 Password:", newPassword);

  process.exit(0);
};

resetSuperAdmin().catch(err => {
  console.error("❌ Error:", err.sqlMessage || err.message);
  process.exit(1);
});
