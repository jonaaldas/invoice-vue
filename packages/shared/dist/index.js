import axios from "axios";
export const api = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
});
// Add request interceptor
api.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
export default api;
