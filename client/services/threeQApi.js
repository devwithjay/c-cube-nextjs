
const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  "/api";

async function request(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
  } catch {
    throw new Error(
      "Unable to connect to the assessment server."
    );
  }

  const contentType =
    response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : {};

  if (!response.ok) {
    const validationMessage =
      Array.isArray(data?.errors)
        ? data.errors
            .map(
              (issue) =>
                `${issue.field}: ${issue.message}`
            )
            .join(" ")
        : "";

    throw new Error(
      validationMessage ||
        data?.message ||
        `Request failed with status ${response.status}.`
    );
  }

  return data;
}


/* =========================================================
   GET CURRENT / PUBLISHED ASSESSMENT
   ========================================================= */

export async function getPublishedAssessment() {
  return request("/3q/current");
}


/* =========================================================
   START ASSESSMENT
   ========================================================= */

export async function startAssessment(participant) {
  return request("/3q/sessions", {
    method: "POST",
    body: JSON.stringify(participant)
  });
}


/* =========================================================
   GET SESSION
   Useful for timer/session status.
   ========================================================= */

export async function getAssessmentSession(sessionId) {
  return request(
    `/3q/sessions/${sessionId}`
  );
}


/* =========================================================
   GET TEST FOR SESSION
   ========================================================= */

export async function getAssessmentForSession(
  sessionId
) {
  return request(
    `/3q/sessions/${sessionId}/test`
  );
}


/* =========================================================
   SAVE / UPDATE ANSWER
   Supports:
   - MCQ
   - Short answer
   - Long answer
   ========================================================= */

export async function saveAssessmentAnswer(
  sessionId,
  questionId,
  selectedOptionId = null,
  answerText = null
) {
  return request(
    `/3q/sessions/${sessionId}/answers`,
    {
      method: "POST",
      body: JSON.stringify({
        questionId,
        selectedOptionId,
        answerText
      })
    }
  );
}


/* =========================================================
   SAVE / UPDATE MULTIPLE ANSWERS
   ========================================================= */

export async function saveAssessmentAnswersBatch(
  sessionId,
  answersArray
) {
  return request(
    `/3q/sessions/${sessionId}/answers/batch`,
    {
      method: "POST",
      body: JSON.stringify({
        answers: answersArray
      })
    }
  );
}


/* =========================================================
   SUBMIT ASSESSMENT
   ========================================================= */

export async function submitAssessment(
  sessionId
) {
  return request(
    `/3q/sessions/${sessionId}/submit`,
    {
      method: "POST"
    }
  );
}


/* =========================================================
   GET RESULT
   ========================================================= */

export async function getAssessmentResult(
  sessionId
) {
  return request(
    `/3q/sessions/${sessionId}/result`
  );
}


/* =========================================================
   RETEST REQUEST
   ========================================================= */

export async function requestRetestPermission(
  participant,
  reason = ""
) {
  return request(
    "/3q/retest-request",
    {
      method: "POST",
      body: JSON.stringify({
        participant,
        reason
      })
    }
  );
}
