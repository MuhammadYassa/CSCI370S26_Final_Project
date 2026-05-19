import apiFetch from "./apiFetch";

export async function getCases() {
  const response = await apiFetch.get("/cases");
  return response.data;
}

export async function getCaseById(caseId) {
  const response = await apiFetch.get(`/cases/${caseId}`);
  return response.data;
}

export async function createCase(formData) {
  const response = await apiFetch.post("/cases", formData);
  return response.data;
}