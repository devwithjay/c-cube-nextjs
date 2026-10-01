import pg from "pg";

const { Client } = pg;

const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
 password: "root",
  database: "c_cube",
});

async function testConnection() {
  try {
    await client.connect();

    console.log("✅ PostgreSQL connected successfully!");

    const result = await client.query("SELECT NOW()");

    console.log("🕒 PostgreSQL server time:", result.rows[0].now);
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:");
    console.error(error.message);
  } finally {
    await client.end();
  }
}

testConnection();