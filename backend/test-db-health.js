import { db, get, all, run, withTransaction } from "./src/db/database.js";
import { initializeDatabase } from "./src/db/schema.js";
import { seedDatabase } from "./src/db/seed.js";

async function runHealthCheck() {
  console.log("==========================================");
  console.log("      DATABASE HEALTH CHECK & DIAGNOSTICS");
  console.log("==========================================");

  try {
    // 0. Ensure schema & seed are initialized
    await initializeDatabase();
    await seedDatabase();

    // 1. Connection check
    const nowResult = await get("SELECT NOW() as current_time, current_database() as db_name, version() as pg_version");
    console.log("✅ Connection: Active");
    console.log(`📌 Database Name: ${nowResult.db_name}`);
    console.log(`🕒 Server Time: ${nowResult.current_time}`);

    // 2. Check Tables
    const tables = await all(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(`\n📊 Tables (${tables.length} found):`);
    
    for (const t of tables) {
      const countRes = await get(`SELECT COUNT(*) as count FROM "${t.table_name}"`);
      console.log(`   • ${t.table_name.padEnd(26)} -> ${countRes.count} row(s)`);
    }

    // 3. Test Transaction functionality
    console.log("\n🧪 Testing Transaction Handling:");
    await withTransaction(async () => {
      const testVal = await get("SELECT 123 as val");
      if (testVal.val !== 123) throw new Error("Transaction query failed");
    });
    console.log("✅ withTransaction(): OK");

    // 4. Test 3Q Assessment Data
    console.log("\n📋 Testing 3Q Assessment Data:");
    const publishedTest = await get(`SELECT id, title, status, version, duration_seconds FROM three_q_tests WHERE status = 'published' LIMIT 1`);
    if (publishedTest) {
      console.log(`✅ Active Test found: [ID ${publishedTest.id}] "${publishedTest.title}" (Status: ${publishedTest.status}, Duration: ${publishedTest.duration_seconds}s)`);
      const sections = await all(`SELECT id, section_number, name, question_limit FROM three_q_sections WHERE test_id = ? ORDER BY section_number`, [publishedTest.id]);
      console.log(`   Sections (${sections.length}):`, sections.map(s => `Section ${s.section_number} (${s.name})`).join(", "));
      
      const totalQuestions = await get(`
        SELECT COUNT(q.id) as q_count 
        FROM three_q_questions q 
        INNER JOIN three_q_sections s ON s.id = q.section_id 
        WHERE s.test_id = ?
      `, [publishedTest.id]);
      console.log(`   Questions in active test: ${totalQuestions.q_count}`);
    } else {
      console.log("⚠️ No published test currently active");
    }

    // 5. Test Admin User
    console.log("\n👤 Testing Admin Users:");
    const admins = await all(`SELECT id, name, email, role, is_active FROM admin_users`);
    if (admins.length > 0) {
      for (const a of admins) {
        console.log(`✅ Admin: ${a.name} | ${a.email} | Role: ${a.role} | Active: ${a.is_active === 1 || a.is_active === true ? 'Yes' : 'No'}`);
      }
    } else {
      console.log("⚠️ No admin users in database");
    }

    console.log("\n==========================================");
    console.log("🎉 ALL DATABASE CHECKS PASSED PERFECTLY!");
    console.log("==========================================");
  } catch (error) {
    console.error("❌ Database Health Check Error:", error);
  } finally {
    await db.end();
  }
}

runHealthCheck();
