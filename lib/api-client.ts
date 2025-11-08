import { apiClient } from './axios_client';
import { Job, CreateJobRequest, ApiResponse, TokenStatus } from '@/types/job';

// Client-side API that calls Next.js API routes
export const scraperApi = {
  async createJob(data: CreateJobRequest): Promise<ApiResponse<{ jobId: string; status: string; message: string }>> {
    const response = await apiClient.post('/scraper/jobs', data);
    return response.data;
  },

  async getJob(jobId: string): Promise<{ success: boolean; job?: Job; message?: string; error?: string }> {
    const response = await apiClient.get(`/scraper/jobs/${jobId}`);
    return response.data;
  },

  async getAllJobs(params?: { status?: string; limit?: number }): Promise<ApiResponse<{ jobs: Job[]; count: number }>> {
    const response = await apiClient.get('/scraper/jobs', { params });
    return response.data;
  },

  async cancelJob(jobId: string): Promise<ApiResponse<{ message: string; jobId: string }>> {
    const response = await apiClient.post(`/scraper/jobs/${jobId}/cancel`);
    return response.data;
  },

  async resumeJob(jobId: string): Promise<ApiResponse<{ message: string; jobId: string }>> {
    const response = await apiClient.post(`/scraper/jobs/${jobId}/resume`);
    return response.data;
  },

  async cleanupJobs(olderThanMinutes = 30): Promise<ApiResponse<{ cleanedJobs: string[]; message: string }>> {
    const response = await apiClient.post('/scraper/jobs/cleanup', { olderThanMinutes });
    return response.data;
  },
};

export const tokenApi = {
  async getTokenStatus(): Promise<ApiResponse<TokenStatus>> {
    const response = await apiClient.get('/scraper/token');
    return response.data;
  },

  async refreshToken(): Promise<ApiResponse<{ token_type: string; expires_in: number; access_token: string; refresh_token: string }>> {
    const response = await apiClient.post('/scraper/token/refresh');
    return response.data;
  },

  async saveAccessToken(data: {
    access_token: string;
    token_type?: string;
    expires_in?: number;
    scope?: string
  }): Promise<ApiResponse<TokenStatus>> {
    const response = await apiClient.post('/scraper/token/save', data);
    return response.data;
  },
};
