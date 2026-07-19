const API_URL = "http://127.0.0.1:8000";

export async function createMission(description) {
  const response = await fetch(`${API_URL}/api/missions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Could not create mission");
  }
  return response.json();
}

export async function updateTask(taskId, status) {
  const response = await fetch(`${API_URL}/api/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return response.json();
}

export async function getAnalytics() {
  const response = await fetch(`${API_URL}/api/analytics`);
  return response.json();
}