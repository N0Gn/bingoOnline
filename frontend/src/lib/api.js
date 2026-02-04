import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getMyHistory() {
  return api.get("/me/history");
}

export function listRooms() {
  return api.get("/rooms");
}

export function createRoom(payload) {
  return api.post("/rooms", payload);
}

export function getRoomByCode(code) {
  return api.get(`/rooms/${code}`);
}

export function joinRoom(code) {
  return api.post(`/rooms/${code}/join`);
}
      
