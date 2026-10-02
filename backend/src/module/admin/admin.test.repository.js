import {
  get,
  all,
  run
} from "../../db/database.js";


/*
|--------------------------------------------------------------------------
| Get all tests
|--------------------------------------------------------------------------
*/

export async function findAllTests() {

  return all(
    `
    SELECT
      id,
      title,
      slug,
      description,
      duration_seconds,
      live_message,
      status,
      version,
      created_at,
      updated_at

    FROM three_q_tests

    ORDER BY
      created_at DESC,
      version DESC
    `
  );

}


/*
|--------------------------------------------------------------------------
| Find test by ID
|--------------------------------------------------------------------------
*/

export async function findTestById(
  testId
) {

  return get(
    `
    SELECT
      id,
      title,
      slug,
      description,
      duration_seconds,
      live_message,
      status,
      version,
      created_at,
      updated_at

    FROM three_q_tests

    WHERE id = ?

    LIMIT 1
    `,
    [testId]
  );

}


/*
|--------------------------------------------------------------------------
| Find test by ID or Slug
|--------------------------------------------------------------------------
*/

export async function findTestByIdOrSlug(
  idOrSlug
) {

  let query = `
    SELECT
      id,
      title,
      slug,
      description,
      duration_seconds,
      live_message,
      status,
      version,
      created_at,
      updated_at
    FROM three_q_tests
  `;
  
  if (isNaN(idOrSlug)) {
    query += ` WHERE slug = ? `;
  } else {
    query += ` WHERE id = ? `;
  }

  return get(query, [idOrSlug]);
}

/*
|--------------------------------------------------------------------------
| Create test
|--------------------------------------------------------------------------
*/

export async function createTest(
  test
) {

  const result =
    await run(
      `
      INSERT INTO three_q_tests
      (
        title,
        slug,
        description,
        duration_seconds,
        live_message,
        status,
        version
      )

      VALUES (?, ?, ?, ?, ?, 'draft', ?)
      `,
      [
        test.title,
        test.slug || null,
        test.description,
        test.durationSeconds,
        test.liveMessage || "Assessment will be live shortly.",
        test.version
      ]
    );


  return findTestById(
    result.id
  );

}


/*
|--------------------------------------------------------------------------
| Update draft test
|--------------------------------------------------------------------------
*/

export async function updateTest(
  testId,
  test
) {

  await run(
    `
    UPDATE three_q_tests

    SET
      title = ?,
      slug = ?,
      description = ?,
      duration_seconds = ?,
      live_message = ?,
      updated_at = CURRENT_TIMESTAMP

    WHERE id = ?

    
    `,
    [
      test.title,
      test.slug || null,
      test.description,
      test.durationSeconds,
      test.liveMessage || "Assessment will be live shortly.",
      testId
    ]
  );


  return findTestById(
    testId
  );

}


/*
|--------------------------------------------------------------------------
| Publish test
|--------------------------------------------------------------------------
*/

export async function publishTest(
  testId
) {

  await run(
    `
    UPDATE three_q_tests

    SET
      status = 'published',
      updated_at = CURRENT_TIMESTAMP

    WHERE id = ?

    
    `,
    [testId]
  );


  return findTestById(
    testId
  );

}


/*
|--------------------------------------------------------------------------
| Close published test
|--------------------------------------------------------------------------
*/

export async function closeTest(
  testId
) {

  await run(
    `
    UPDATE three_q_tests

    SET
      status = 'closed',
      updated_at = CURRENT_TIMESTAMP

    WHERE id = ?

    AND status = 'published'
    `,
    [testId]
  );


  return findTestById(
    testId
  );

}

/*
|--------------------------------------------------------------------------
| Delete draft test
|--------------------------------------------------------------------------
*/

export async function deleteTest(
  testId
) {

  await run(
    `
    DELETE FROM three_q_answers

    WHERE session_id IN (
      SELECT id
      FROM three_q_sessions
      WHERE test_id = ?
    )
    `,
    [testId]
  );

  await run(
    `
    DELETE FROM three_q_results

    WHERE test_id = ?
    `,
    [testId]
  );

  await run(
    `
    DELETE FROM three_q_sessions

    WHERE test_id = ?
    `,
    [testId]
  );

  return run(
    `
    DELETE FROM three_q_tests

    WHERE id = ?
    `,
    [testId]
  );

}

export async function findResultsByTestId(
  testId,
  page = 1,
  limit = 30
) {
  const offset = (page - 1) * limit;
  return all(
    `
    SELECT
      r.id,
      r.session_id,
      p.id as participant_id,
      r.test_id,
      r.total_questions,
      r.attempted_questions,
      r.total_score,
      r.section1_score,
      r.section2_score,
      r.section3_score,
      r.submitted_at,
      p.name,
      p.branch,
      p.division,
      p.prn,
      p.college_email,
      p.mobile_number,
      p.campus,
      p.living_at,
      p.gender
    FROM three_q_results r
    INNER JOIN three_q_sessions s
      ON s.id = r.session_id
    INNER JOIN three_q_participants p
      ON p.id = s.participant_id
    WHERE r.test_id = ?
    ORDER BY r.submitted_at DESC
    LIMIT ? OFFSET ?
    `,
    [testId, limit, offset]
  );
}

export async function findRetestRequestsByTestId(
  testId
) {
  return all(
    `
    SELECT
      r.id,
      r.test_id,
      r.participant_id,
      r.reason,
      r.status,
      r.requested_at,
      r.reviewed_at,
      p.name,
      p.branch,
      p.division,
      p.prn,
      p.college_email,
      p.mobile_number
    FROM three_q_retest_requests r
    INNER JOIN three_q_participants p
      ON p.id = r.participant_id
    WHERE r.test_id = ?
    ORDER BY r.requested_at DESC
    `,
    [testId]
  );
}

export async function updateRetestRequest(
  requestId,
  status,
  adminId
) {
  await run(
    `
    UPDATE three_q_retest_requests
    SET
      status = ?,
      reviewed_by_admin_id = ?,
      reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
    `,
    [status, adminId, requestId]
  );

  return get(
    `
    SELECT
      id,
      test_id,
      participant_id,
      reason,
      status,
      requested_at,
      reviewed_by_admin_id,
      reviewed_at
    FROM three_q_retest_requests
    WHERE id = ?
    LIMIT 1
    `,
    [requestId]
  );
}
export async function unpublishTest(
  testId
) {
  const result = await db.query(
    `
      UPDATE three_q_tests
      SET
        status = 'draft',
        updated_at = CURRENT_TIMESTAMP
      WHERE
        id = $1
      RETURNING *
    `,
    [testId]
  );
  return result.rows[0] || null;
}

export async function updateParticipant(
  participantId,
  data
) {
  return run(
    `
    UPDATE three_q_participants
    SET
      name = COALESCE(?, name),
      branch = COALESCE(?, branch),
      division = COALESCE(?, division),
      prn = COALESCE(?, prn),
      college_email = COALESCE(?, college_email),
      mobile_number = COALESCE(?, mobile_number),
      campus = COALESCE(?, campus),
      living_at = COALESCE(?, living_at),
      gender = COALESCE(?, gender)
    WHERE id = ?
    `,
    [
      data.name ?? null,
      data.branch ?? null,
      data.division ?? null,
      data.prn ?? null,
      data.collegeEmail ?? null,
      data.mobileNumber ?? null,
      data.campus ?? null,
      data.livingAt ?? null,
      data.gender ?? null,
      participantId
    ]
  );
}

export async function countResultsByTestId(testId) {
  const result = await get(
    `SELECT COUNT(*) as total FROM three_q_results WHERE test_id = ?`,
    [testId]
  );
  return Number(result?.total || 0);
}
