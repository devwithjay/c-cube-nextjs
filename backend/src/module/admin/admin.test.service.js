import {
  findAllTests,
  findTestById,
  findResultsByTestId,
  findRetestRequestsByTestId,
  updateRetestRequest,
  createTest,
  updateTest,
  publishTest,
  closeTest,
  deleteTest
} from "./admin.test.repository.js";


/*
|--------------------------------------------------------------------------
| Get all tests
|--------------------------------------------------------------------------
*/

export async function getAllTests() {

  return findAllTests();

}


/*
|--------------------------------------------------------------------------
| Get one test
|--------------------------------------------------------------------------
*/

export async function getTest(
  testId
) {

  const test =
    await findTestById(
      testId
    );


  if (!test) {

    const error =
      new Error(
        "Test not found."
      );

    error.statusCode = 404;

    throw error;

  }


  return test;

}


/*
|--------------------------------------------------------------------------
| Create test
|--------------------------------------------------------------------------
*/

export async function createNewTest(
  data
) {

  const title =
    data.title.trim();


  if (!title) {

    const error =
      new Error(
        "Test title is required."
      );

    error.statusCode = 400;

    throw error;

  }


  if (
    !Number.isInteger(
      data.durationSeconds
    ) ||
    data.durationSeconds <= 0
  ) {

    const error =
      new Error(
        "Duration must be a positive integer."
      );

    error.statusCode = 400;

    throw error;

  }


  const test =
    await createTest({

      title,
      slug: data.slug ? String(data.slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : null,

      description:
        data.description
          ? data.description.trim()
          : null,

      durationSeconds:
        data.durationSeconds,

      liveMessage:
        data.liveMessage,

      version:
        1

    });


  return test;

}


/*
|--------------------------------------------------------------------------
| Update draft test
|--------------------------------------------------------------------------
*/

export async function updateDraftTest(
  testId,
  data
) {

  const existing =
    await findTestById(
      testId
    );


  if (!existing) {

    const error =
      new Error(
        "Test not found."
      );

    error.statusCode = 404;

    throw error;

  }





  const title =
    data.title.trim();


  if (!title) {

    const error =
      new Error(
        "Test title is required."
      );

    error.statusCode = 400;

    throw error;

  }


  if (
    !Number.isInteger(
      data.durationSeconds
    ) ||
    data.durationSeconds <= 0
  ) {

    const error =
      new Error(
        "Duration must be a positive integer."
      );

    error.statusCode = 400;

    throw error;

  }


  return updateTest(
    testId,
    {

      title,
      slug: data.slug ? String(data.slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : null,

      description:
        data.description
          ? data.description.trim()
          : null,

      durationSeconds:
        data.durationSeconds

    }
  );

}


/*
|--------------------------------------------------------------------------
| Publish test
|--------------------------------------------------------------------------
*/

export async function publishDraftTest(
  testId
) {

  const existing =
    await findTestById(
      testId
    );


  if (!existing) {

    const error =
      new Error(
        "Test not found."
      );

    error.statusCode = 404;

    throw error;

  }





  /*
  |--------------------------------------------------------------------------
  | Question validation will be added when the question builder exists.
  |--------------------------------------------------------------------------
  */

  return publishTest(
    testId
  );

}


/*
|--------------------------------------------------------------------------
| Close published test
|--------------------------------------------------------------------------
*/

export async function closePublishedTest(
  testId
) {

  const existing =
    await findTestById(
      testId
    );


  if (!existing) {

    const error =
      new Error(
        "Test not found."
      );

    error.statusCode = 404;

    throw error;

  }


  if (
    existing.status !==
    "published"
  ) {

    const error =
      new Error(
        "Only published tests can be closed."
      );

    error.statusCode = 409;

    throw error;

  }


  return closeTest(
    testId
  );

}

/*
|--------------------------------------------------------------------------
| Delete assessment
|--------------------------------------------------------------------------
*/

export async function deleteAssessment(
  testId
) {

  const existing =
    await findTestById(
      testId
    );

  if (!existing) {

    const error =
      new Error(
        "Test not found."
      );

    error.statusCode = 404;

    throw error;

  }

  await deleteTest(
    testId
  );

  return {
    id: testId
  };

}

export async function getTestResults(
  testId,
  page = 1,
  limit = 30
) {
  const test = await findTestById(testId);

  if (!test) {
    const error = new Error("Test not found.");
    error.statusCode = 404;
    throw error;
  }

  const [results, totalCount] = await Promise.all([
    findResultsByTestId(testId, page, limit),
    countResultsByTestId(testId)
  ]);

  return {
    results,
    totalCount
  };
}

export async function listRetestRequests(
  testId
) {
  const test = await findTestById(testId);

  if (!test) {
    const error = new Error("Test not found.");
    error.statusCode = 404;
    throw error;
  }

  return findRetestRequestsByTestId(testId);
}

export async function reviewRetestRequest(
  requestId,
  status,
  adminId
) {
  if (!["approved", "rejected"].includes(status)) {
    const error = new Error("Status must be either 'approved' or 'rejected'.");
    error.statusCode = 400;
    throw error;
  }

  return updateRetestRequest(requestId, status, adminId);
}
export async function unpublishTest(
  testId
) {
  const updatedTest =
    await repository.unpublishTest(
      testId
    );
  if (!updatedTest) {
    throw createServiceError(
      "Test not found or could not be unpublished.",
      404
    );
  }
  return updatedTest;
}
