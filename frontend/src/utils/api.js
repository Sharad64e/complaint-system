import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL || "https://complaint-system-kgoq.onrender.com/api",
});
// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth APIs ────────────────────────────────────────────────────────────────
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// ─── Complaint APIs ───────────────────────────────────────────────────────────
export const addComplaint = (data) => API.post("/complaints", data);
export const getAllComplaints = (params) => API.get("/complaints", { params });
export const getComplaintById = (id) => API.get(`/complaints/${id}`);
export const updateComplaintStatus = (id, status) =>
  API.put(`/complaints/${id}`, { status });
export const deleteComplaint = (id) => API.delete(`/complaints/${id}`);
export const searchByLocation = (location) =>
  API.get("/complaints/search", { params: { location } });

// ─── AI APIs ─────────────────────────────────────────────────────────────────
export const analyzeComplaint = (data) => API.post("/ai/analyze", data);

export default API;
