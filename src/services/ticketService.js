import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ticketService = {
  createTicket: async (payload) => {
    const res = await api.post("/tickets", payload);
    return res.data;
  },
  getMyTickets: async () => {
    const res = await api.get("/tickets");
    return res.data;
  },
  getMyTicket: async (id) => {
    const res = await api.get(`/tickets/${id}`);
    return res.data;
  },
  replyAsPartner: async (id, text) => {
    const res = await api.post(`/tickets/${id}/messages`, { text });
    return res.data;
  },
  // Admin
  getAllTickets: async (status = "all", partnerSearch = "") => {
    const res = await api.get(
      `/admin/tickets?status=${encodeURIComponent(status)}&partnerSearch=${encodeURIComponent(partnerSearch)}`
    );
    return res.data;
  },
  replyAsAdmin: async (id, text) => {
    const res = await api.post(`/admin/tickets/${id}/messages`, { text });
    return res.data;
  },
  updateTicket: async (id, payload) => {
    const res = await api.patch(`/admin/tickets/${id}`, payload);
    return res.data;
  },
};

export default api;
