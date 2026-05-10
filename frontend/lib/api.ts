import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
console.log("Using API URL:", API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    return api.post("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
  register: (data: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => api.post("/auth/register", data),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data: { token: string; new_password: string }) =>
    api.post("/auth/reset-password", data),
};

// User API
export const userApi = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (data: any) => api.put("/users/me", data),
};

// Transactions API
export const transactionApi = {
  getAll: (params?: any) => api.get("/transactions", { params }),
  create: (data: any) => api.post("/transactions", data),
  update: (id: number, data: any) => api.put(`/transactions/${id}`, data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
};

// Categories API
export const categoryApi = {
  getAll: (type?: string) => api.get("/categories", { params: { type } }),
  create: (data: any) => api.post("/categories", data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// Budgets API
export const budgetApi = {
  getAll: () => api.get("/budgets"),
  create: (data: any) => api.post("/budgets", data),
  update: (id: number, data: any) => api.put(`/budgets/${id}`, data),
  delete: (id: number) => api.delete(`/budgets/${id}`),
};

// Statistics API
export const statsApi = {
  getBalance: (params?: any) => api.get("/statistics/balance", { params }),
  getCategories: (params?: any) =>
    api.get("/statistics/categories", { params }),
  getMonthly: (months?: number) =>
    api.get("/statistics/monthly", { params: { months } }),
  getDashboard: () => api.get("/statistics/dashboard"),
};
