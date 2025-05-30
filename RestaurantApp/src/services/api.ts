import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  ApiResponse,
  Restaurant,
  RestaurantsResponse,
  Reservation,
  ReservationsResponse,
  CreateReservationRequest,
  UpdateReservationRequest,
} from '../types';

// Update this URL to match your backend server
// For development, use your computer's IP address instead of localhost
// You can find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
const BASE_URL = 'http://localhost:3000/api'; // Using localhost for local development

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use(async (config) => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    });

    // Handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  // Restaurants
  async getRestaurants(
    search?: string,
    location?: string,
    cuisine?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<RestaurantsResponse>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (location) params.append('location', location);
    if (cuisine) params.append('cuisine', cuisine);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response: AxiosResponse<ApiResponse<RestaurantsResponse>> = await this.api.get(
      `/restaurants?${params.toString()}`
    );
    return response.data;
  }

  async getRestaurant(id: number): Promise<ApiResponse<{ restaurant: Restaurant }>> {
    const response: AxiosResponse<ApiResponse<{ restaurant: Restaurant }>> = await this.api.get(
      `/restaurants/${id}`
    );
    return response.data;
  }

  async getCuisines(): Promise<ApiResponse<{ cuisines: string[] }>> {
    const response: AxiosResponse<ApiResponse<{ cuisines: string[] }>> = await this.api.get(
      '/restaurants/meta/cuisines'
    );
    return response.data;
  }

  async getLocations(): Promise<ApiResponse<{ locations: string[] }>> {
    const response: AxiosResponse<ApiResponse<{ locations: string[] }>> = await this.api.get(
      '/restaurants/meta/locations'
    );
    return response.data;
  }

  // Reservations
  async createReservation(reservation: CreateReservationRequest): Promise<ApiResponse<{ reservation: Reservation }>> {
    const response: AxiosResponse<ApiResponse<{ reservation: Reservation }>> = await this.api.post(
      '/reservations',
      reservation
    );
    return response.data;
  }

  async getUserReservations(
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<ReservationsResponse>> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response: AxiosResponse<ApiResponse<ReservationsResponse>> = await this.api.get(
      `/user/reservations?${params.toString()}`
    );
    return response.data;
  }

  async getReservation(id: number): Promise<ApiResponse<{ reservation: Reservation }>> {
    const response: AxiosResponse<ApiResponse<{ reservation: Reservation }>> = await this.api.get(
      `/reservations/${id}`
    );
    return response.data;
  }

  async updateReservation(
    id: number,
    updates: UpdateReservationRequest
  ): Promise<ApiResponse<{ reservation: Reservation }>> {
    const response: AxiosResponse<ApiResponse<{ reservation: Reservation }>> = await this.api.put(
      `/reservations/${id}`,
      updates
    );
    return response.data;
  }

  async cancelReservation(id: number): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/reservations/${id}`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response: AxiosResponse<{ status: string; message: string }> = await this.api.get('/health');
    return response.data;
  }
}

export default new ApiService(); 