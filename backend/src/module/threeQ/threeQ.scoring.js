/*
|--------------------------------------------------------------------------
| 3Q SCORING
|--------------------------------------------------------------------------
|
| Question types:
|
| 1. MCQ
|    -> Automatically scored using is_correct
|
| 2. Short Answer
|    -> Answer is stored
|    -> No automatic marks
|
| 3. Long Answer
|    -> Answer is stored
|    -> No automatic marks
|
|--------------------------------------------------------------------------
*/


export function calculateThreeQScore(
  answers = [],
  totalQuestions = 0,
  sections = []
) {
  let totalScore = 0;
  let section1Score = 0;
  let section2Score = 0;
  let section3Score = 0;

  const attemptedQuestions = new Set(answers.map((a) => a.question_id || a.questionId)).size;

  // Sort sections to determine the first 3 sections reliably (by sort_order or section_number)
  const sortedSections = [...sections].sort((a, b) => 
    (a.sort_order ?? a.section_number) - (b.sort_order ?? b.section_number)
  );
  
  const section1Num = sortedSections.length > 0 ? Number(sortedSections[0].section_number) : 1;
  const section2Num = sortedSections.length > 1 ? Number(sortedSections[1].section_number) : 2;
  const section3Num = sortedSections.length > 2 ? Number(sortedSections[2].section_number) : 3;

  for (const answer of answers) {
    const questionType = String(answer.question_type || "mcq").toLowerCase();
    if (questionType !== "mcq") continue;

    const isCorrect = Number(answer.is_correct) === 1 || answer.is_correct === true;
    if (!isCorrect) continue;

    const marks = Number(answer.marks || 0);
    totalScore += marks;

    const sectionNumber = Number(answer.section_number);

    if (sectionNumber === section1Num) {
      section1Score += marks;
    } else if (sectionNumber === section2Num) {
      section2Score += marks;
    } else if (sectionNumber === section3Num) {
      section3Score += marks;
    }
  }

  return {
    totalQuestions: Number(totalQuestions),
    attemptedQuestions,
    totalScore,
    section1Score,
    section2Score,
    section3Score
  };
}

