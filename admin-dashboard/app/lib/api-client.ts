import axios, { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode?: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const statusCode = axiosError.response?.status;
    const responseData = axiosError.response?.data;

    throw new ApiError(
      responseData?.message || axiosError.message,
      statusCode,
      responseData?.code,
      responseData?.details
    );
  }
  
  // For non-Axios errors
  if (error instanceof Error) {
    throw new ApiError(error.message);
  }
  
  throw new ApiError('An unknown error occurred');
};

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(handleApiError(error));
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(handleApiError(error));
  }
);

// Cache implementation
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheItem<unknown>>();

export const getCached = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  duration = CACHE_DURATION
): Promise<T> => {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < duration) {
    return cached.data as T;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
};

// Add cache invalidation
getCached.invalidate = async (key: string): Promise<void> => {
  cache.delete(key);
};

getCached.invalidateAll = async (): Promise<void> => {
  cache.clear();
};

// Rate limiting
const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

const rateLimit = {
  timestamp: Date.now(),
  count: 0,
};

const checkRateLimit = () => {
  const now = Date.now();
  if (now - rateLimit.timestamp > RATE_LIMIT_DURATION) {
    rateLimit.count = 0;
    rateLimit.timestamp = now;
  }
  
  if (rateLimit.count >= MAX_REQUESTS) {
    throw new ApiError(
      'Rate limit exceeded. Please try again later.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }
  
  rateLimit.count++;
};

// Add rate limiting to request interceptor
apiClient.interceptors.request.use((config) => {
  checkRateLimit();
  return config;
});

export type ApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
}; 
