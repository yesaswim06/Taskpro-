import axios from 'axios';

const API = axios.create({ baseURL: "https://taskpro-backend.onrender.com/api" });

// Automatically add the token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers['x-auth-token'] = token;
    return req;
});

export const login = (data) => API.post('/auth/login', data);
export const fetchTasks = () => API.get('/tasks');
export const createTask = (data) => API.post('/tasks', data);
