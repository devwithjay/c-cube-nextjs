import { findAnswersForSession } from "./backend/src/module/threeQ/threeQ.repository.js";
import { calculateThreeQScore } from "./backend/src/module/threeQ/threeQ.scoring.js";
import { all } from "./backend/src/db/database.js";

async function testScore() {
  const sessions = await all(`SELECT id FROM three_q_sessions WHERE status = 'submitted' LIMIT 5;`);
  console.log("SESSIONS:", sessions);
  for (const session of sessions) {
    const answers = await findAnswersForSession(session.id);
    console.log(`Answers for session ${session.id}:`, answers.length);
    if (answers.length > 0) {
      console.log("First answer:", answers[0]);
      const score = calculateThreeQScore(answers, answers.length);
      console.log("Score calculation:", score);
    }
  }
  process.exit(0);
}

testScore();
