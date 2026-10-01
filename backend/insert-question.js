import { run } from "./src/db/database.js";

const result = await run(`
  INSERT INTO three_q_questions
  (
    section_id,
    question_number,
    question_text,
    question_type,
    marks,
    is_active
  )
  VALUES
  (
    1,
    1,
    'Which number comes next: 2, 4, 6, 8, ?',
    'mcq',
    1,
    1
  )
`);

console.log("Question ID:", result.id);