import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '@/types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiService = {
  // GET request
  get: async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // DELETE request
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // PATCH request
  patch: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await api.patch(url, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },
};

// Auth service
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    return apiService.post<{ token: string; user: any }>('/auth/login', credentials);
  },

  register: async (userData: any) => {
    return apiService.post<{ token: string; user: any }>('/auth/register', userData);
  },

  logout: async () => {
    return apiService.post('/auth/logout');
  },

  getProfile: async () => {
    return apiService.get<any>('/auth/profile');
  },

  updateProfile: async (userData: any) => {
    return apiService.put<any>('/auth/profile', userData);
  },
};

// Users service
export const usersService = {
  getAll: async (params?: any) => {
    return apiService.get<PaginatedResponse<any>>('/users', params);
  },

  getById: async (id: string) => {
    return apiService.get<any>(`/users/${id}`);
  },

  update: async (id: string, userData: any) => {
    return apiService.put<any>(`/users/${id}`, userData);
  },

  delete: async (id: string) => {
    return apiService.delete(`/users/${id}`);
  },

  restore: async (id: string) => {
    return apiService.post(`/users/${id}/restore`);
  },
};

// Rooms service
export const roomsService = {
  getAll: async (params?: any) => {
    return apiService.get<PaginatedResponse<any>>('/rooms', params);
  },

  getById: async (id: string) => {
    return apiService.get<any>(`/rooms/${id}`);
  },

  create: async (roomData: any) => {
    return apiService.post<any>('/rooms', roomData);
  },

  update: async (id: string, roomData: any) => {
    return apiService.put<any>(`/rooms/${id}`, roomData);
  },

  delete: async (id: string) => {
    return apiService.delete(`/rooms/${id}`);
  },

  getAvailable: async (params?: any) => {
    return apiService.get<any[]>('/rooms/available', params);
  },
};

// Reservations service
export const reservationsService = {
  getAll: async (params?: any) => {
    return apiService.get<PaginatedResponse<any>>('/reservations', params);
  },

  getById: async (id: string) => {
    return apiService.get<any>(`/reservations/${id}`);
  },

  create: async (reservationData: any) => {
    return apiService.post<any>('/reservations', reservationData);
  },

  update: async (id: string, reservationData: any) => {
    return apiService.put<any>(`/reservations/${id}`, reservationData);
  },

  delete: async (id: string) => {
    return apiService.delete(`/reservations/${id}`);
  },

  cancel: async (id: string) => {
    return apiService.post(`/reservations/${id}/cancel`);
  },
};

// Guests service
export const guestsService = {
  getAll: async (params?: any) => {
    return apiService.get<PaginatedResponse<any>>('/guests', params);
  },

  getById: async (id: string) => {
    return apiService.get<any>(`/guests/${id}`);
  },

  create: async (guestData: any) => {
    return apiService.post<any>('/guests', guestData);
  },

  update: async (id: string, guestData: any) => {
    return apiService.put<any>(`/guests/${id}`, guestData);
  },

  delete: async (id: string) => {
    return apiService.delete(`/guests/${id}`);
  },

  getHistory: async (id: string) => {
    return apiService.get<any[]>(`/guests/${id}/history`);
  },
};

// Billing service
export const billingService = {
  getAll: async (params?: any) => {
    return apiService.get<PaginatedResponse<any>>('/billing', params);
  },

  getById: async (id: string) => {
    return apiService.get<any>(`/billing/${id}`);
  },

  create: async (billingData: any) => {
    return apiService.post<any>('/billing', billingData);
  },

  update: async (id: string, billingData: any) => {
    return apiService.put<any>(`/billing/${id}`, billingData);
  },

  delete: async (id: string) => {
    return apiService.delete(`/billing/${id}`);
  },

  processPayment: async (id: string, paymentData: any) => {
    return apiService.post(`/billing/${id}/process-payment`, paymentData);
  },
};

// Housekeeping service
export const housekeepingService = {
  getAll: async (params?: any) => {
    return apiService.get<PaginatedResponse<any>>('/housekeeping', params);
  },

  getById: async (id: string) => {
    return apiService.get<any>(`/housekeeping/${id}`);
  },

  create: async (taskData: any) => {
    return apiService.post<any>('/housekeeping', taskData);
  },

  update: async (id: string, taskData: any) => {
    return apiService.put<any>(`/housekeeping/${id}`, taskData);
  },

  delete: async (id: string) => {
    return apiService.delete(`/housekeeping/${id}`);
  },

  complete: async (id: string) => {
    return apiService.post(`/housekeeping/${id}/complete`);
  },

  getByRoom: async (roomId: string) => {
    return apiService.get<any[]>(`/housekeeping/room/${roomId}`);
  },
};

export default api; 