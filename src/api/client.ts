import axios from 'axios';

export const API_BASE_URL = 'http://localhost:4000';
const API_PATH = '/v1';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PATH}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  console.log(`API Request to: ${config.url}`);
  if (token) {
    console.log(`Auth token found for request to: ${config.url}`);
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log(`No auth token for request to: ${config.url}`);
  }
  return config;
});

// Add response interceptor for better error logging
apiClient.interceptors.response.use(
  response => {
    console.log(`API Response from ${response.config.url}:`, response.status);
    return response;
  },
  error => {
    if (error.response) {
      console.error(`API Error ${error.response.status} from ${error.config?.url}:`, error.response.data);
    } else if (error.request) {
      console.error(`API No Response from ${error.config?.url}:`, error.request);
    } else {
      console.error(`API Request Error:`, error.message);
    }
    return Promise.reject(error);
  }
);

export interface UserForm {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  authentication_token: string;
}

export interface User {
  id: number;
  created_at: string;
  name: string;
  email: string;
  activated: boolean;
}

export interface UserProfileResponse {
  user: User;
}

export interface Movie {
  id: number;
  title: string;
  year: number;
  runtime: string;
  genres: string[];
  version: number;
  image?: string;
  is_favourite?: boolean;
}

export interface MoviesResponse {
  metadata: {
    current_page: number;
    page_size: number;
    first_page: number;
    last_page: number;
    total_records: number;
  };
  movies: Movie[];
}

export interface FavoriteMovieResponse {
  message: string;
}

// Function to add a movie to favorites
export const addMovieToFavorites = async (movieId: number): Promise<FavoriteMovieResponse> => {
  const response = await apiClient.post<FavoriteMovieResponse>(`/movies/${movieId}`);
  return response.data;
};

// Function to remove a movie from favorites
export const removeMovieFromFavorites = async (movieId: number): Promise<FavoriteMovieResponse> => {
  const response = await apiClient.delete<FavoriteMovieResponse>(`/movies/${movieId}`);
  return response.data;
}; 