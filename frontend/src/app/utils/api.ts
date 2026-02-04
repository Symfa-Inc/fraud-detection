import axios from "axios";

// Create an instance of axios with the base URL
const api = axios.create({
    baseURL: "http://localhost:8000",
});

export const logBackendRoot = async () => {
    try {
        const response = await api.get("/");
        console.log("Backend root response:", response.data);
    } catch (error) {
        console.error("Failed to fetch backend root:", error);
    }
};

// Export the Axios instance
export default api;
