export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Restaurant {
  id: number;
  name: string;
  location: string;
  description: string;
  image_url: string;
  rating: number;
  price_range: string;
  cuisine_type: string;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  restaurant_id: number;
  date: string;
  time: string;
  people_count: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at: string;
  updated_at: string;
  restaurant_name?: string;
  restaurant_location?: string;
  restaurant_image?: string;
  restaurant_rating?: number;
}

export interface CreateReservationRequest {
  restaurant_id: number;
  date: string;
  time: string;
  people_count: number;
  special_requests?: string;
}

export interface UpdateReservationRequest {
  date?: string;
  time?: string;
  people_count?: number;
  special_requests?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any[];
}

export interface RestaurantsResponse {
  restaurants: Restaurant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ReservationsResponse {
  reservations: Reservation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  RestaurantDetail: { restaurant: Restaurant };
  Profile: undefined;
};

export type TabParamList = {
  RestaurantList: undefined;
  Profile: undefined;
}; 