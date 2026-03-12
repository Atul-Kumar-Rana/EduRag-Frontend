import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:8080/api',
  baseURL: 'https://prephub.atul.codes/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
