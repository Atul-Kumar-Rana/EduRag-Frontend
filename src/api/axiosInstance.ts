import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:8080/api',
  baseURL: 'http://15.206.173.5:8080/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
