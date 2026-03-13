// we'll be using FETCH to call our backend API routes

const API_BASE = "http://localhost:3001";

export async function getProjects() {
const res = await fetch(`${API_BASE}/api/projects`);
    return res.json();
}

export async function getProjectDocuments(projectID) {
const res = await fetch(`${API_BASE}/api/projects/${projectID}/documents`);
    return res.json();
}

export async function getDocuments() {
const res = await fetch(`${API_BASE}/api/documents`);
    return res.json();
}

export async function getProjectById(projectID) {
const res = await fetch(`${API_BASE}/api/projects/${projectID}`);
    return res.json();
}