import { all, get } from "./backend/src/db/database.js";

async function check() {
  const sections = await all(`SELECT * FROM three_q_sections;`);
  console.log("SECTIONS:", sections);

  const results = await all(`SELECT id, session_id, test_id, section1_score, section2_score, section3_score, total_score FROM three_q_results;`);
  console.log("RESULTS:", results);
  
  process.exit(0);
}

check();
