import {
  findParticipantByPRN,
  findPublishedTest,
  getActiveOrSubmittedSession
} from "./threeQ.repository.js";

export async function checkCertificateEligibility(prn) {
  const participant = await findParticipantByPRN(prn);
  if (!participant) {
    const error = new Error("No test record found for this PRN.");
    error.statusCode = 404;
    throw error;
  }

  const test = await findPublishedTest();
  if (!test) {
    const error = new Error("No active test found.");
    error.statusCode = 404;
    throw error;
  }

  const session = await getActiveOrSubmittedSession(participant.id, test.id);
  if (!session || session.status !== "submitted") {
    const error = new Error("Test has not been submitted.");
    error.statusCode = 400;
    throw error;
  }

  return {
    eligible: true,
    participantName: participant.name,
    prn: participant.prn,
    submittedAt: session.submitted_at
  };
}
