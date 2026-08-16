import axios from "axios";

// Create axios instance
// const api = axios.create({
//   baseURL:
//     import.meta.env.VITE_REACT_APP_API_URL ||
//     "https://reactbackend.verifyhub.in/api",
//   withCredentials: true,
// });
const api = axios.create({
  baseURL:
    import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - remove token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
export const authService = {
  login: async (data) => {
    const response = await api.post("/auth/login", {
      email: data.email,
      password: data.password,
    });

    if (response.data.success && response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },
  signup: async (data) => {
    const payload = {
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      phone: data.phone,
      password: data.password,
    };

    const response = await api.post("/auth/register", payload);

    if (response.data.success && response.data.token) {
      localStorage.setItem("token", response.data.token);

      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  // ========================================
  // FORGOT PASSWORD
  // ========================================
  forgotPassword: async (email) => {
    const response = await api.post("/auth/request-password-reset", {
      email,
    });

    return response.data;
  },

  // ========================================
  // LOGOUT
  // ========================================
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
};

// Credit Bureau APIs

export const creditAPI = {
  // ==========================================
  // GENERATE CIBIL REPORT
  // ==========================================
  generateCibilReport: async (payload) =>
    await api.post("/credit/generate-cibil-report", payload),

  // ==========================================
  // GET CIBIL REPORT
  // ==========================================

  getCibilReport: async (id) => {
    const response = await api.get(`/credit/get-cibil-rpt/${id}`);
    return response.data;
  },
  // ==========================================
  // GENERATE CRIF REPORT
  // ==========================================
  generateCrifReport: async (payload) =>
    await api.post("/credit/generate-crif-report", payload),

  generateEquifaxReport: async (payload) =>
    await api.post("/credit/generate-equifax-report", payload),

  generateExperianReport: async (payload) =>
    await api.post("/credit/generate-experian-report", payload),
};
