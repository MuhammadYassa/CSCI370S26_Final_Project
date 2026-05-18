import apiFetch from "./apiFetch";

// GET ALL CASES
export async function getCases() {

  const response = await apiFetch.get("/cases");

  return response.data.cases;
}

// GET SINGLE CASE
export async function getCaseById(caseId) {

  const response = await apiFetch.get(`/cases/${caseId}`);

  return response.data;
}

// CREATE CASE
export async function createCase(caseData) {

  const response = await apiFetch.post("/cases", caseData);

  return response.data;
}