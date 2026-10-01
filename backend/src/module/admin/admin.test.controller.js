import {
  getAllTests,
  getTest,
  getTestResults,
  listRetestRequests as listTestRetests,
  reviewRetestRequest as reviewTestRetest,
  createNewTest,
  updateDraftTest,
  publishDraftTest,
  closePublishedTest,
  deleteAssessment
} from "./admin.test.service.js";


/*
|--------------------------------------------------------------------------
| GET /api/admin/tests
|--------------------------------------------------------------------------
*/

export async function listTests(
  req,
  res,
  next
) {

  try {

    const tests =
      await getAllTests();


    return res
      .status(200)
      .json({

        success: true,

        data:
          tests

      });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| GET /api/admin/tests/:testId
|--------------------------------------------------------------------------
*/

export async function getTestById(
  req,
  res,
  next
) {

  try {

    const testId =
      Number(
        req.params.testId
      );


    if (
      !Number.isInteger(testId) ||
      testId <= 0
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Invalid test ID."

        });

    }


    const test =
      await getTest(
        testId
      );


    return res
      .status(200)
      .json({

        success: true,

        data:
          test

      });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| POST /api/admin/tests
|--------------------------------------------------------------------------
*/

export async function createTest(
  req,
  res,
  next
) {

  try {

    const {
      title,
      description,
      durationSeconds,
      liveMessage
    } = req.body;


    if (
      typeof title !== "string"
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Test title is required."

        });

    }


    const test =
      await createNewTest({

        title,

        description,

        durationSeconds:
          Number(
            durationSeconds
          ),

        liveMessage:
          liveMessage ? String(liveMessage) : null

      });


    return res
      .status(201)
      .json({

        success: true,

        message:
          "Test created successfully.",

        data:
          test

      });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| PUT /api/admin/tests/:testId
|--------------------------------------------------------------------------
*/

export async function updateTest(
  req,
  res,
  next
) {

  try {

    const testId =
      Number(
        req.params.testId
      );


    if (
      !Number.isInteger(testId) ||
      testId <= 0
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Invalid test ID."

        });

    }


    const {
      title,
      description,
      durationSeconds,
      liveMessage
    } = req.body;


    if (
      typeof title !== "string"
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Test title is required."

        });

    }


    const test =
      await updateDraftTest(
        testId,

        {

          title,

          description,

          durationSeconds:
            Number(
              durationSeconds
            )

        }
      );


    return res
      .status(200)
      .json({

        success: true,

        message:
          "Draft test updated successfully.",

        data:
          test

      });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| POST /api/admin/tests/:testId/publish
|--------------------------------------------------------------------------
*/

export async function publishTest(
  req,
  res,
  next
) {

  try {

    const testId =
      Number(
        req.params.testId
      );


    if (
      !Number.isInteger(testId) ||
      testId <= 0
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Invalid test ID."

        });

    }


    const test =
      await publishDraftTest(
        testId
      );


    return res
      .status(200)
      .json({

        success: true,

        message:
          "Test published successfully.",

        data:
          test

      });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| POST /api/admin/tests/:testId/close
|--------------------------------------------------------------------------
*/

export async function closeTest(
  req,
  res,
  next
) {

  try {

    const testId =
      Number(
        req.params.testId
      );


    if (
      !Number.isInteger(testId) ||
      testId <= 0
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Invalid test ID."

        });

    }


    const test =
      await closePublishedTest(
        testId
      );


    return res
      .status(200)
      .json({

        success: true,

        message:
          "Test closed successfully.",

        data:
          test

      });

  }
  catch (error) {

    next(error);

  }

}


/*
|--------------------------------------------------------------------------
| DELETE /api/admin/tests/:testId
|--------------------------------------------------------------------------
*/

export async function deleteTest(
  req,
  res,
  next
) {

  try {

    const testId =
      Number(
        req.params.testId
      );

    if (
      !Number.isInteger(testId) ||
      testId <= 0
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Invalid test ID."

        });

    }

    await deleteAssessment(
      testId
    );

    return res
      .status(200)
      .json({

        success: true,

        message:
          "Assessment deleted successfully."

      });

  }
  catch (error) {

    next(error);

  }

}

export async function listTestResults(
  req,
  res,
  next
) {
  try {
    const testId = Number(req.params.testId);

    if (!Number.isInteger(testId) || testId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID."
      });
    }

    const results = await getTestResults(testId);

    return res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
}

export async function listRetestRequests(
  req,
  res,
  next
) {
  try {
    const testId = Number(req.params.testId);

    if (!Number.isInteger(testId) || testId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid test ID."
      });
    }

    const requests = await listTestRetests(testId);

    return res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
}

export async function reviewRetestRequest(
  req,
  res,
  next
) {
  try {
    const requestId = Number(req.params.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID."
      });
    }

    const status = String(req.body?.status || "").trim().toLowerCase();
    const adminId = Number(req.admin?.id);

    const result = await reviewTestRetest(requestId, status, adminId);

    return res.json({
      success: true,
      message: `Retest request ${status}.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}