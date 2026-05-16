import axios from "axios";

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:5000";

export type LoginResponse = {
  token: string;
  user: { id: number; email: string; role: string; name?: string };
};

function getToken(): string | null {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    // backend expects standard Authorization header
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

