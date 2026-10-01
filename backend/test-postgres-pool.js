import { query, pool } from "./src/db/postgres.js";

async function testPool() {
  try {
    const result = await query("SELECT NOW() AS current_time");

    console.log("✅ PostgreSQL pool connected!");
    console.log("🕒 Database time:", result.rows[0].current_time);
  } catch (error) {
    console.error("❌ PostgreSQL pool connection failed:");
    console.error(error.message);
  } finally {
    await pool.end();
  }
}

testPool();