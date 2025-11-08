import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Auth token will be handled by NextAuth automatically
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect to login page
      window.location.href = '/auth/sign-in'
    }
    return Promise.reject(error)
  }
)