import axios from "axios";

export const createAxiosInstance = (API_URL, getAuthHeaders) => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: getAuthHeaders(),
    });
  
    instance.interceptors.request.use((config) => {
      config.headers = { ...config.headers, ...getAuthHeaders() };
      return config;
    });
  
    return instance;
  };