const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('focusboard_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const content = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(content.error || content.message || 'הפעולה לא הצליחה');
  }
  return content;
}

const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
const del = (path) => request(path, { method: 'DELETE' });

export const api = {
  register: (body) => post('/users/register', body),
  verify: (body) => post('/users/verify', body),
  resend: (verificationToken) => post('/users/verify-request', { verificationToken }),
  login: (body) => post('/users/login', body),
  passwordRecovery: (email) => post('/users/password-recovery', { email }),
  verifyPasswordRecovery: (body) => post('/users/password-recovery/verify', body),
  resetPassword: (body) => post('/users/password-reset', body),
  courses: () => request('/courses'),
  createCourse: (body) => post('/courses', body),
  updateCourse: (id, body) => put(`/courses/${id}`, body),
  deleteCourse: (id) => del(`/courses/${id}`),
  lecturers: () => request('/lecturers'),
  createLecturer: (body) => post('/lecturers', body),
  updateLecturer: (id, body) => put(`/lecturers/${id}`, body),
  deleteLecturer: (id) => del(`/lecturers/${id}`),
  assignments: (query = '') => request(`/assignments${query ? `?${query}` : ''}`),
  createAssignment: (body) => post('/assignments', body),
  updateAssignment: (id, body) => put(`/assignments/${id}`, body),
  deleteAssignment: (id) => del(`/assignments/${id}`)
};
