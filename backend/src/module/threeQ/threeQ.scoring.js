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
  totalQuestions = 0
) {

  /*
  |--------------------------------------------------------------------------
  | Initialize scores
  |--------------------------------------------------------------------------
  */

  let totalScore = 0;

  let section1Score = 0;

  let section2Score = 0;

  let section3Score = 0;


  /*
  |--------------------------------------------------------------------------
  | Count attempted questions
  |--------------------------------------------------------------------------
  |
  | Every answer row represents an attempted question.
  |
  |--------------------------------------------------------------------------
  */

  const attemptedQuestions =
    answers.length;


  /*
  |--------------------------------------------------------------------------
  | Calculate score
  |--------------------------------------------------------------------------
  */

  for (
    const answer of answers
  ) {

    /*
    |--------------------------------------------------------------------------
    | Normalize question type
    |--------------------------------------------------------------------------
    */

    const questionType =
      String(
        answer.question_type || "mcq"
      ).toLowerCase();


    /*
    |--------------------------------------------------------------------------
    | Only MCQ can be automatically scored
    |--------------------------------------------------------------------------
    */

    if (
      questionType !== "mcq"
    ) {

      continue;

    }


    /*
    |--------------------------------------------------------------------------
    | Check correctness
    |--------------------------------------------------------------------------
    */

    const isCorrect =
      Number(answer.is_correct) === 1 ||
      answer.is_correct === true;


    if (!isCorrect) {

      continue;

    }


    /*
    |--------------------------------------------------------------------------
    | Question marks
    |--------------------------------------------------------------------------
    */

    const marks =
      Number(
        answer.marks || 0
      );


    /*
    |--------------------------------------------------------------------------
    | Add total score
    |--------------------------------------------------------------------------
    */

    totalScore +=
      marks;


    /*
    |--------------------------------------------------------------------------
    | Add section-wise score
    |--------------------------------------------------------------------------
    */

    const sectionNumber =
      Number(
        answer.section_number
      );


    if (
      sectionNumber === 1
    ) {

      section1Score +=
        marks;

    }

    else if (
      sectionNumber === 2
    ) {

      section2Score +=
        marks;

    }

    else if (
      sectionNumber === 3
    ) {

      section3Score +=
        marks;

    }

  }


  /*
  |--------------------------------------------------------------------------
  | Return score
  |--------------------------------------------------------------------------
  */

  return {

    totalQuestions:
      Number(totalQuestions),

    attemptedQuestions,

    totalScore,

    section1Score,

    section2Score,

    section3Score

  };

}