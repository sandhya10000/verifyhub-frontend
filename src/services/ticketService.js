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

// Builds multipart/form-data: text fields plus up to 3 image files under "attachments".
function buildTicketForm(fields, files) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, v);
  });
  files.forEach((f) => form.append("attachments", f));
  return form;
}

// Pulls image files out of a paste event (e.g. a Win+Shift+S screenshot).
// Returns [] when the clipboard holds no files, so plain-text paste is untouched.
export function getPastedImages(event) {
  const items = Array.from(event.clipboardData?.items || []);
  const stamp = Date.now();
  return items
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter(Boolean)
    .map((f, i) => {
      const ext = f.type.split("/")[1] || "png";
      return new File([f], `screenshot-${stamp}-${i + 1}.${ext}`, { type: f.type });
    });
}

export const ticketService = {
  // payload: { category, reference, description, files? } — files are sent as multipart.
  createTicket: async ({ files = [], ...fields }) => {
    const res = await api.post("/tickets", buildTicketForm(fields, files));
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
  replyAsPartner: async (id, text, files = []) => {
    const res = await api.post(`/tickets/${id}/messages`, buildTicketForm({ text }, files));
    return res.data;
  },
  // Admin
  getAllTickets: async (status = "all", partnerSearch = "") => {
    const res = await api.get(
      `/admin/tickets?status=${encodeURIComponent(status)}&partnerSearch=${encodeURIComponent(partnerSearch)}`
    );
    return res.data;
  },
  getTicketById: async (id) => {
    const res = await api.get(`/admin/tickets/${id}`);
    return res.data;
  },
  replyAsAdmin: async (id, text, files = []) => {
    const res = await api.post(`/admin/tickets/${id}/messages`, buildTicketForm({ text }, files));
    return res.data;
  },
  updateTicket: async (id, payload) => {
    const res = await api.patch(`/admin/tickets/${id}`, payload);
    return res.data;
  },
};

export default api;
