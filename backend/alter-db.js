import { exec } from "./src/db/database.js";
async function run() {
  await exec("ALTER TABLE three_q_sessions ADD COLUMN IF NOT EXISTS is_auto_submitted BOOLEAN DEFAULT FALSE;");
  console.log("Done");
  process.exit(0);
}
run();
