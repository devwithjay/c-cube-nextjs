import { run } from "./src/db/database.js";

await run(`
  INSERT INTO three_q_options
  (
    question_id,
    option_key,
    option_text,
    is_correct,
    sort_order
  )
  VALUES
    (1, 'A', '9', 0, 1),
    (1, 'B', '10', 1, 2),
    (1, 'C', '11', 0, 3),
    (1, 'D', '12', 0, 4)
`);

console.log("Options inserted successfully.");