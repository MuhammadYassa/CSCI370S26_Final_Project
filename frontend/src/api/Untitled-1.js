import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export async function getCases() {
  const response = await axios.get(`${API_BASE_URL}/cases`);
  return response.data;
}

export async function getCaseById(id) {
  const response = await axios.get(`${API_BASE_URL}/cases/${id}`);
  return response.data;
}

export async function createCase(formData) {
  const response = await axios.post(`${API_BASE_URL}/cases`, formData);
  return response.data;
}