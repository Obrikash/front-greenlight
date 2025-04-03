import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    console.log('Adding token to request:', config.url);
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log('No token available for request:', config.url);
  }
  return config;
});

// Add response interceptor for better error logging
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
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

export interface Movie {
  id: number;
  title: string;
  year: number;
  runtime: string;
  genres: string[];
  version: number;
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