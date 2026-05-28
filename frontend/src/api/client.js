import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Automatically attach JWT token to every request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (email, password) =>
  API.post("/api/auth/register", { email, password });

export const login = (email, password) => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  return API.post("/api/auth/login", form);
};

export const getMe = () => API.get("/api/auth/me");

// Tasks
export const getTasks = () => API.get("/api/tasks");
export const createTask = (data) => API.post("/api/tasks", data);
export const updateTask = (id, data) => API.patch(`/api/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/api/tasks/${id}`);

// Calendar
export const getEvents = () => API.get("/api/calendar");
export const createEvent = (data) => API.post("/api/calendar", data);
export const deleteEvent = (id) => API.delete(`/api/calendar/${id}`);

// Schedule
export const generateSchedule = (params) =>
  API.post("/api/schedule/generate", params);
export const getLatestSchedule = () => API.get("/api/schedule/latest");