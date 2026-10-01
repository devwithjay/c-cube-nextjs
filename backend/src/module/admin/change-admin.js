import bcrypt from "bcryptjs";
import { get, run } from "../../db/database.js";

// =====================================
// CHANGE THESE TWO VALUES
// =====================================

const oldEmail = "admin@vit.edu";

const newEmail = "your-new-email@vit.edu";
const newPassword = "YourNewStrongPassword@123";

// =====================================

async function changeAdminCredentials() {
  try {
    const admin = await get(
      `
        SELECT id, email
        FROM admin_users
        WHERE email = ?
        LIMIT 1
      `,
      [oldEmail]
    );

    if (!admin) {
      throw new Error(
        `Admin with email ${oldEmail} was not found.`
      );
    }

    const existingEmail = await get(
      `
        SELECT id
        FROM admin_users
        WHERE email = ?
          AND id != ?
        LIMIT 1
      `,
      [newEmail, admin.id]
    );

    if (existingEmail) {
      throw new Error(
        `The new email ${newEmail} is already being used.`
      );
    }

    if (newPassword.length < 8) {
      throw new Error(
        "New password must contain at least 8 characters."
      );
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      12
    );

    await run(
      `
        UPDATE admin_users
        SET
          email = ?,
          password_hash = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        newEmail,
        passwordHash,
        admin.id
      ]
    );

    console.log("");
    console.log("=================================");
    console.log("ADMIN CREDENTIALS UPDATED");
    console.log("=================================");
    console.log(`New Email: ${newEmail}`);
    console.log("New Password: [the password you entered]");
    console.log("=================================");
    console.log("");
  } catch (error) {
    console.error(
      "Failed to change admin credentials:",
      error.message
    );

    process.exitCode = 1;
  }
}

changeAdminCredentials();