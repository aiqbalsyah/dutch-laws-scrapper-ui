export type JobStatus = 'pending' | 'scraping' | 'processing' | 'completed' | 'failed' | 'paused' | 'cancelled';

export interface LawHierarchy {
  delen: number;
  hoofdstukken: number;
  artikelen: number;
  leden: number;
}

export interface LawResult {
  lawTitle: string;
  lawTopicId: string;
  lawUrl: string;
  processedParagraphs: number;
  hierarchy?: LawHierarchy;
  errors: Array<{ node?: string; error: string }>;
}

export interface JobResults {
  searchTerm: string;
  totalLaws: number;
  processedLaws: number;
  laws: LawResult[];
  errors: Array<{ law?: string; error: string }>;
}

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
  results?: JobResults;
  errors: Array<{ node?: string; error: string }>;
  options?: {
    selectedIdentifiers?: string[] | null;
    selectedLaws?: Array<{ title: string; identifier: string; articleCount?: number | null }> | null;
  };
}

export interface CreateJobRequest {
  searchInput: string;
  maxLaws?: number;
  email?: string;
  selectedIdentifiers?: string[];
  selectedLaws?: Array<{ title: string; identifier: string; articleCount?: number | null }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  // Direct fields for job creation response
  jobId?: string;
  status?: string;
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
