const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  "/api";

const TOKEN_KEY = "c_cube_admin_token";


/* =========================================================
   TOKEN HELPERS
   ========================================================= */

export function saveAdminToken(token) {
  if (!token) {
    return;
  }

  sessionStorage.setItem(
    TOKEN_KEY,
    token
  );
}


export function getSavedAdminToken() {
  return sessionStorage.getItem(
    TOKEN_KEY
  );
}


export function clearAdminToken() {
  sessionStorage.removeItem(
    TOKEN_KEY
  );
}


function getAdminToken() {
  return getSavedAdminToken();
}


/* =========================================================
   COMMON ADMIN REQUEST
   ========================================================= */

async function adminRequest(
  endpoint,
  options = {}
) {

  const token =
    getAdminToken();

  const headers = {
    "Content-Type":
      "application/json",

    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  let response;

  try {

    response =
      await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          ...options,
          headers
        }
      );

  } catch (error) {

    throw new Error(
      "Unable to connect to the backend. Make sure the backend is running on port 5000."
    );

  }

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  let data = {};

  if (
    contentType.includes(
      "application/json"
    )
  ) {

    data =
      await response.json();

  } else {

    const text =
      await response.text();

    if (text) {
      data = {
        message: text
      };
    }

  }

  if (!response.ok) {

    throw new Error(
      data?.message ||
      `Request failed with status ${response.status}.`
    );

  }

  return data;
}


/* =========================================================
   ADMIN AUTH
   ========================================================= */

export async function adminLogin(
  email,
  password
) {

  return adminRequest(
    "/admin/auth/login",
    {
      method: "POST",

      body: JSON.stringify({
        email,
        password
      })
    }
  );

}


export async function getCurrentAdmin() {

  return adminRequest(
    "/admin/auth/me"
  );

}


export async function changeAdminPassword(
  currentPassword,
  newPassword
) {

  return adminRequest(
    "/admin/auth/change-password",
    {
      method: "POST",

      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    }
  );

}


export async function changeAdminEmail(
  currentPassword,
  newEmail
) {

  return adminRequest(
    "/admin/auth/change-email",
    {
      method: "POST",

      body: JSON.stringify({
        currentPassword,
        newEmail
      })
    }
  );

}


/* =========================================================
   ADMIN TESTS
   ========================================================= */

export async function getAdminTests() {

  return adminRequest(
    "/admin/tests"
  );

}


export async function createAdminTest(
  data
) {

  return adminRequest(
    "/admin/tests",
    {
      method: "POST",

      body: JSON.stringify(data)
    }
  );

}


export async function getAdminTest(
  testId
) {

  return adminRequest(
    `/admin/tests/${testId}`
  );

}


export async function updateAdminTest(
  testId,
  data
) {

  return adminRequest(
    `/admin/tests/${testId}`,
    {
      method: "PUT",

      body: JSON.stringify(data)
    }
  );

}


export async function deleteAdminTest(
  testId
) {

  return adminRequest(
    `/admin/tests/${testId}`,
    {
      method: "DELETE"
    }
  );

}


export async function publishAdminTest(
  testId
) {

  return adminRequest(
    `/admin/tests/${testId}/publish`,
    {
      method: "POST"
    }
  );

}


export async function closeAdminTest(
  testId
) {

  return adminRequest(
    `/admin/tests/${testId}/close`,
    {
      method: "POST"
    }
  );

}


export async function getAdminTestResults(
  testId
) {

  return adminRequest(
    `/admin/tests/${testId}/results`
  );

}


/* =========================================================
   TEST SECTIONS
   ========================================================= */

export async function getTestSections(
  testId
) {

  return adminRequest(
    `/admin/tests/${testId}/sections`
  );

}


export async function createTestSection(
  testId,
  data
) {

  return adminRequest(
    `/admin/tests/${testId}/sections`,
    {
      method: "POST",

      body: JSON.stringify(data)
    }
  );

}


export async function updateTestSection(
  sectionId,
  data
) {

  return adminRequest(
    `/admin/tests/sections/${sectionId}`,
    {
      method: "PUT",

      body: JSON.stringify(data)
    }
  );

}


/* =========================================================
   SECTION QUESTIONS
   ========================================================= */

export async function getSectionQuestions(
  sectionId
) {

  return adminRequest(
    `/admin/sections/${sectionId}/questions`
  );

}


export async function createSectionQuestion(
  sectionId,
  data
) {

  return adminRequest(
    `/admin/sections/${sectionId}/questions`,
    {
      method: "POST",

      body: JSON.stringify(data)
    }
  );

}


/* =========================================================
   UPDATE QUESTION
   ========================================================= */

export async function updateSectionQuestion(
  questionId,
  data
) {

  return adminRequest(
    `/admin/questions/${questionId}`,
    {
      method: "PUT",

      body: JSON.stringify(data)
    }
  );

}


/* =========================================================
   DELETE QUESTION
   ========================================================= */

export async function deleteSectionQuestion(
  questionId
) {

  return adminRequest(
    `/admin/questions/${questionId}`,
    {
      method: "DELETE"
    }
  );

}
export async function unpublishAdminTest(
  testId
) {
  return adminRequest(
    `/admin/tests/${testId}/unpublish`,
    {
      method: "POST"
    }
  );
}

export async function deleteTestSection(
  sectionId
) {
  return adminRequest(
    `/admin/tests/sections/${sectionId}`,
    {
      method: "DELETE"
    }
  );
}

export async function updateParticipantDetails(participantId, data) {
  const token = getAdminToken();

  const response = await fetch(`${API_BASE_URL}/admin/tests/participants/${participantId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const responseData = await response.json();

  if (!response.ok || !responseData.success) {
    throw new Error(responseData.message || "Failed to update participant.");
  }

  return responseData;
}
