import bcrypt from "bcryptjs";
import { run } from "./src/db/database.js";
import { env } from "./src/config/env.js";

async function main() {
  const email = process.env.ADMIN_EMAIL || "atharv.jambhule24@vit.edu";
  const password = process.env.ADMIN_PASSWORD || "CCube@123";
  
  const hash = await bcrypt.hash(password, 12);
  
  try {
    await run(
      `
      INSERT INTO admin_users
      (name, email, password_hash, role, is_active)
      VALUES (?, ?, ?, 'super_admin', 1)
      `,
      ["Atharv Jambhule", email, hash]
    );
    console.log(`✅ Successfully added custom admin: ${email}`);
    process.exit(0);
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      console.log("Admin already exists!");
      process.exit(0);
    }
    console.error("Error:", err);
    process.exit(1);
  }
}

main();
