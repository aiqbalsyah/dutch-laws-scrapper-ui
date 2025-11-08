export type JobStatus = 'pending' | 'scraping' | 'processing' | 'completed' | 'failed' | 'paused' | 'cancelled';

export interface Job {
  jobId: string;
  searchInput: string;
  maxLaws?: number;
  email?: string;
  status: JobStatus;
  statusMessage: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  totalLaws: number;
  scrapedLaws: number;
  processedLaws: number;
  processedParagraphs: number;
  currentLaw?: string | null;
  currentLawTopicId?: string | null;
  processedLawTitles: string[];
  results?: any;
  errors: Array<{ node?: string; error: string }>;
}

export interface CreateJobRequest {
  searchInput: string;
  maxLaws?: number;
  email?: string;
  selectedIdentifiers?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TokenStatus {
  token_type: string;
  scope: string;
  expires_in: number;
  timestamp: string;
  expires_at: string;
  is_expired: boolean;
  minutes_until_expiry: number;
  has_access_token: boolean;
  has_refresh_token: boolean;
  status: 'valid' | 'expiring_soon' | 'expired';
}
