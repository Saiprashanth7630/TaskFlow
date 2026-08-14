const API_BASE = '/api';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = (data && data.error) ? data.error : (typeof data === 'string' && data ? data : `Request failed with status ${response.status}`);
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Fetch default / first board
  async getBoard(boardId = null) {
    const url = boardId ? `${API_BASE}/boards/${boardId}` : `${API_BASE}/boards`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  // Hand-written SQL Query 1: Column task counts
  async getColumnTaskCounts(boardId) {
    const res = await fetch(`${API_BASE}/boards/${boardId}/column-task-counts`);
    return handleResponse(res);
  },

  // Hand-written SQL Query 2: Tasks by priority
  async getTasksByPriority(boardId, priority) {
    const res = await fetch(`${API_BASE}/boards/${boardId}/tasks-by-priority?priority=${encodeURIComponent(priority)}`);
    return handleResponse(res);
  },

  // Create a new task
  async createTask(taskData) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  // Edit an existing task
  async updateTask(taskId, taskData) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  // Move a task to a different column
  async moveTask(taskId, columnId) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column_id: columnId })
    });
    return handleResponse(res);
  },

  // Delete a task
  async deleteTask(taskId) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};
