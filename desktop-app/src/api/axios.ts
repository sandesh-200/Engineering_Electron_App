import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${apiUrl}/api`,
  withCredentials: true,
});
