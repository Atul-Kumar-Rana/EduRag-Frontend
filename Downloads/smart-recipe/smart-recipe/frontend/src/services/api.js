import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
};

// ── Recipes ───────────────────────────────────────────────────────────────────
export const recipeService = {
  getAll: () => API.get('/recipes'),
  getById: (id) => API.get(`/recipes/${id}`),
  search: (params) => API.get('/recipes/search', { params }),
  create: (data) => API.post('/recipes', data),
  update: (id, data) => API.put(`/recipes/${id}`, data),
  delete: (id) => API.delete(`/recipes/${id}`),
  getMyRecipes: () => API.get('/recipes/my-recipes'),
  getSaved: () => API.get('/recipes/saved'),
  toggleSave: (id) => API.post(`/recipes/${id}/save`),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewService = {
  getByRecipe: (recipeId) => API.get(`/recipes/${recipeId}/reviews`),
  add: (recipeId, data) => API.post(`/recipes/${recipeId}/reviews`, data),
  delete: (recipeId, reviewId) => API.delete(`/recipes/${recipeId}/reviews/${reviewId}`),
};

export default API;
