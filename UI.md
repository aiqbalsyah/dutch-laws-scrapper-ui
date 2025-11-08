# UI Guide - Dutch Law Scraper Job Management

This guide explains how to build a Next.js UI for managing scraping jobs with Firebase Authentication.

## Table of Contents
1. [API Endpoints](#api-endpoints)
   - [Job Management](#job-management-endpoints)
   - [Token Management](#token-management-endpoints)
2. [Firebase Setup](#firebase-setup)
3. [Next.js Integration](#nextjs-integration)
4. [Authentication Flow](#authentication-flow)
5. [UI Components](#ui-components)
6. [Token Management UI](#token-management-ui)
7. [Example Code](#example-code)

---

## API Endpoints

### Base URL
```
https://scraper-nzsuxiw5eq-uc.a.run.app
```

### 1. Create New Job
**POST** `/api/scrape-to-mavim`

**Request Body:**
```json
{
  "searchInput": "Aanbestedingswet 2012",
  "maxLaws": 1,
  "email": "user@example.com"  // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "jobId": "abc123xyz",
  "status": "pending",
  "message": "Job created and queued..."
}
```

**Duplicate Error (409):**
```json
{
  "success": false,
  "error": "Duplicate job",
  "message": "Job for \"Aanbestedingswet 2012\" is already processing...",
  "existingJobId": "existing-id",
  "existingJobStatus": "processing"
}
```

### 2. Get Job Status
**GET** `/api/jobs/:jobId`

**Success Response (200):**
```json
{
  "success": true,
  "job": {
    "jobId": "abc123xyz",
    "searchInput": "Aanbestedingswet 2012",
    "status": "processing",
    "statusMessage": "Creating topics in Mavim...",
    "totalLaws": 1,
    "processedLaws": 0,
    "processedParagraphs": 45,
    "currentLaw": "Aanbestedingswet 2012",
    "createdAt": "2025-11-08T10:00:00.000Z",
    "startedAt": "2025-11-08T10:03:00.000Z",
    "completedAt": null,
    "errors": []
  }
}
```

**Job Statuses:**
- `pending` - Waiting in queue
- `scraping` - Downloading law from government API
- `processing` - Creating topics in Mavim
- `completed` - Successfully finished
- `failed` - Error occurred

### 3. Get All Jobs
**GET** `/api/jobs?status=pending&limit=20`

**Query Parameters:**
- `status` (optional): Filter by status (pending, processing, completed, failed)
- `limit` (optional): Maximum number of jobs to return

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "jobId": "abc123",
      "searchInput": "Aanbestedingswet 2012",
      "status": "completed",
      "createdAt": "2025-11-08T10:00:00.000Z",
      "completedAt": "2025-11-08T15:30:00.000Z"
    }
  ],
  "count": 1
}
```

### 4. Cancel Job
**POST** `/api/jobs/:jobId/cancel`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job cancelled successfully...",
  "jobId": "abc123xyz"
}
```

### 5. Resume Job
**POST** `/api/jobs/:jobId/resume`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job resumed and queued for processing",
  "jobId": "abc123xyz"
}
```

### 6. Cleanup Stuck Jobs
**POST** `/api/jobs/cleanup`

**Request Body:**
```json
{
  "olderThanMinutes": 30  // Optional, default: 30
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cleaned up 3 stuck jobs",
  "cleanedJobs": ["job1", "job2", "job3"]
}
```

---

## Token Management Endpoints

### 7. Get Token Status
**GET** `/api/oauth/token`

Returns detailed information about the current Mavim OAuth token including expiration status.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token_type": "Bearer",
    "scope": "https://adapps.mavimcloud.com/mavim/...",
    "expires_in": 3600,
    "timestamp": "2025-11-08T10:00:00.000Z",
    "expires_at": "2025-11-08T11:00:00.000Z",
    "is_expired": false,
    "minutes_until_expiry": 45,
    "has_access_token": true,
    "has_refresh_token": true,
    "status": "valid"  // "valid" | "expiring_soon" | "expired"
  },
  "history": []
}
```

**Token Statuses:**
- `valid` - Token is active and has > 5 minutes remaining
- `expiring_soon` - Token will expire within 5 minutes
- `expired` - Token has expired

**Error Response (404):**
```json
{
  "success": false,
  "message": "No tokens found. Please authenticate first."
}
```

### 8. Refresh Token
**POST** `/api/oauth/token`

Manually refresh the Mavim OAuth token. Note: The system automatically refreshes tokens when they expire or are about to expire.

**Request Body:**
```json
{
  "client_id": "15e1f0d0-3141-47b0-a87e-323d62b71b75",
  "scope": "https://adapps.mavimcloud.com/mavim/Mavim.iMprove.ReadWrite.All openid profile offline_access",
  "grant_type": "refresh_token"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Access token retrieved successfully",
  "data": {
    "token_type": "Bearer",
    "expires_in": 3600,
    "scope": "...",
    "access_token": "eyJ0...",
    "refresh_token": "0.AYoA...",
    "timestamp": "2025-11-08T11:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "No refresh token available",
  "message": "Please save a refresh token first..."
}
```

---

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it (e.g., "procestoppers")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** authentication:
   - Click "Email/Password"
   - Enable the first toggle (Email/Password)
   - Save

4. (Optional) Enable **Google Sign-In**:
   - Click "Google"
   - Enable the toggle
   - Enter support email
   - Save

### 3. Add Web App to Firebase
1. In Firebase Console, click the **Web** icon (</>) in "Project Overview"
2. Register app:
   - App nickname: "Dutch Law Scraper UI"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
3. Copy the Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "procestoppers.firebaseapp.com",
  projectId: "procestoppers",
  storageBucket: "procestoppers.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 4. Add Authorized Users
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Enter email and password
4. Click "Add user"

### 5. Security Rules (Optional)
If using Firestore directly from the client:
1. Go to **Firestore Database** → **Rules**
2. Add rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read jobs
    match /mavim_scrape_jobs/{jobId} {
      allow read: if request.auth != null;
      allow write: if false; // Only backend can write
    }
  }
}
```

---

## Next.js Integration

### 1. Install Dependencies

```bash
npm install firebase
npm install @heroicons/react  # For icons (optional)
npm install date-fns          # For date formatting (optional)
```

### 2. Project Structure

```
nextjs-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Main jobs dashboard
│   ├── login/
│   │   └── page.tsx         # Login page
│   └── api/                 # Optional: API routes for server-side calls
├── components/
│   ├── JobList.tsx          # Job list component
│   ├── JobCard.tsx          # Individual job card
│   ├── CreateJobForm.tsx    # Form to create new job
│   └── AuthProvider.tsx     # Firebase auth context
├── lib/
│   ├── firebase.ts          # Firebase config
│   ├── api.ts               # API client functions
│   └── hooks/
│       └── useAuth.ts       # Custom auth hook
└── types/
    └── job.ts               # TypeScript types
```

### 3. Firebase Configuration

**`lib/firebase.ts`**
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
```

**`.env.local`**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=procestoppers.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=procestoppers
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=procestoppers.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

NEXT_PUBLIC_API_BASE_URL=https://scraper-nzsuxiw5eq-uc.a.run.app
```

### 4. TypeScript Types

**`types/job.ts`**
```typescript
export type JobStatus = 'pending' | 'scraping' | 'processing' | 'completed' | 'failed' | 'paused';

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
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

---

## Authentication Flow

### 1. Auth Context Provider

**`components/AuthProvider.tsx`**
```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 2. Custom Auth Hook

**`lib/hooks/useAuth.ts`**
```typescript
'use client';

import { useAuth as useAuthContext } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRequireAuth(redirectTo = '/login') {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}
```

### 3. Login Page

**`app/login/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Sign In</h2>
          <p className="mt-2 text-center text-gray-600">
            Dutch Law Scraper - Job Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## UI Components

### 1. API Client

**`lib/api.ts`**
```typescript
import { Job, CreateJobRequest, ApiResponse } from '@/types/job';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const api = {
  async createJob(data: CreateJobRequest): Promise<ApiResponse<{ jobId: string }>> {
    const response = await fetch(`${API_BASE_URL}/api/scrape-to-mavim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getJob(jobId: string): Promise<ApiResponse<{ job: Job }>> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`);
    return response.json();
  },

  async getAllJobs(params?: { status?: string; limit?: number }): Promise<ApiResponse<{ jobs: Job[]; count: number }>> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/jobs?${query}`);
    return response.json();
  },

  async cancelJob(jobId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
    return response.json();
  },

  async resumeJob(jobId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/resume`, {
      method: 'POST',
    });
    return response.json();
  },

  async cleanupJobs(olderThanMinutes = 30): Promise<ApiResponse<{ cleanedJobs: string[] }>> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/cleanup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ olderThanMinutes }),
    });
    return response.json();
  },
};
```

### 2. Create Job Form

**`components/CreateJobForm.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthProvider';

export function CreateJobForm({ onJobCreated }: { onJobCreated?: () => void }) {
  const [searchInput, setSearchInput] = useState('');
  const [maxLaws, setMaxLaws] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await api.createJob({
        searchInput,
        maxLaws: maxLaws === '' ? undefined : maxLaws,
        email: user?.email || undefined,
      });

      if (result.success) {
        setSuccess(`Job created! ID: ${result.data?.jobId}`);
        setSearchInput('');
        setMaxLaws('');
        onJobCreated?.();
      } else {
        setError(result.message || 'Failed to create job');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold">Create New Job</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Input (Law Name)
        </label>
        <input
          type="text"
          required
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="e.g., Aanbestedingswet 2012"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max Laws (Optional)
        </label>
        <input
          type="number"
          min="1"
          value={maxLaws}
          onChange={(e) => setMaxLaws(e.target.value === '' ? '' : parseInt(e.target.value))}
          placeholder="Leave empty for all"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Job'}
      </button>
    </form>
  );
}
```

### 3. Job Card Component

**`components/JobCard.tsx`**
```typescript
'use client';

import { Job } from '@/types/job';
import { api } from '@/lib/api';
import { useState } from 'react';

export function JobCard({ job, onUpdate }: { job: Job; onUpdate?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this job?')) return;

    setLoading(true);
    try {
      await api.cancelJob(job.jobId);
      onUpdate?.();
    } catch (err) {
      alert('Failed to cancel job');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    try {
      await api.resumeJob(job.jobId);
      onUpdate?.();
    } catch (err) {
      alert('Failed to resume job');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'scraping': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const progress = job.totalLaws > 0
    ? Math.round((job.processedParagraphs / (job.totalLaws * 100)) * 100)
    : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{job.searchInput}</h3>
          <p className="text-sm text-gray-500">ID: {job.jobId}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
          {job.status}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Status:</span> {job.statusMessage}</p>
        <p><span className="font-medium">Created:</span> {new Date(job.createdAt).toLocaleString()}</p>

        {job.status === 'processing' && (
          <>
            <p><span className="font-medium">Current Law:</span> {job.currentLaw || 'N/A'}</p>
            <p><span className="font-medium">Progress:</span> {job.processedParagraphs} paragraphs</p>

            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
          </>
        )}

        {job.status === 'completed' && (
          <>
            <p><span className="font-medium">Completed:</span> {job.completedAt ? new Date(job.completedAt).toLocaleString() : 'N/A'}</p>
            <p><span className="font-medium">Total Paragraphs:</span> {job.processedParagraphs}</p>
          </>
        )}

        {job.status === 'failed' && job.errors.length > 0 && (
          <div className="mt-2 p-2 bg-red-50 rounded">
            <p className="font-medium text-red-800">Errors:</p>
            <ul className="list-disc list-inside text-red-600">
              {job.errors.slice(0, 3).map((err, i) => (
                <li key={i}>{err.node}: {err.error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {(job.status === 'processing' || job.status === 'pending') && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        {job.status === 'failed' && (
          <button
            onClick={handleResume}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Resume
          </button>
        )}
      </div>
    </div>
  );
}
```

### 4. Job List Component

**`components/JobList.tsx`**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Job } from '@/types/job';
import { api } from '@/lib/api';
import { JobCard } from './JobCard';

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const result = await api.getAllJobs({
        status: filter === 'all' ? undefined : filter,
        limit: 50,
      });

      if (result.success && result.data) {
        setJobs(result.data.jobs);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Jobs</h2>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No jobs found</div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <JobCard key={job.jobId} job={job} onUpdate={fetchJobs} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 5. Main Dashboard Page

**`app/page.tsx`**
```typescript
'use client';

import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useAuth } from '@/components/AuthProvider';
import { CreateJobForm } from '@/components/CreateJobForm';
import { JobList } from '@/components/JobList';
import { useState } from 'react';

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();
  const { signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dutch Law Scraper</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Job Form */}
          <div className="lg:col-span-1">
            <CreateJobForm
              onJobCreated={() => setRefreshKey(prev => prev + 1)}
            />
          </div>

          {/* Job List */}
          <div className="lg:col-span-2">
            <JobList key={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 6. Root Layout

**`app/layout.tsx`**
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dutch Law Scraper - Job Management',
  description: 'Manage scraping jobs for Dutch legislation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## Token Management UI

### 1. Add Token API Functions

**`lib/api.ts`** (add these functions)
```typescript
export const tokenApi = {
  async getTokenStatus(): Promise<ApiResponse<{
    token_type: string;
    expires_at: string;
    is_expired: boolean;
    minutes_until_expiry: number;
    status: 'valid' | 'expiring_soon' | 'expired';
  }>> {
    const response = await fetch(`${API_BASE_URL}/api/oauth/token`);
    return response.json();
  },

  async refreshToken(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: '15e1f0d0-3141-47b0-a87e-323d62b71b75',
        scope: 'https://adapps.mavimcloud.com/mavim/Mavim.iMprove.ReadWrite.All openid profile offline_access',
        grant_type: 'refresh_token',
      }),
    });
    return response.json();
  },
};
```

### 2. Token Status Component

**`components/TokenStatus.tsx`**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { tokenApi } from '@/lib/api';

export function TokenStatus() {
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchTokenStatus = async () => {
    try {
      const result = await tokenApi.getTokenStatus();
      if (result.success) {
        setTokenData(result.data);
        setError('');
      } else {
        setError(result.message || 'No token found');
      }
    } catch (err) {
      console.error('Failed to fetch token status:', err);
      setError('Failed to fetch token status');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');

    try {
      const result = await tokenApi.refreshToken();

      if (result.success) {
        // Fetch updated status
        await fetchTokenStatus();
        alert('Token refreshed successfully!');
      } else {
        setError(result.message || 'Failed to refresh token');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTokenStatus();

    // Auto-refresh status every 30 seconds
    const interval = setInterval(fetchTokenStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-500">Loading token status...</p>
      </div>
    );
  }

  if (error && !tokenData) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-red-600">Token Error</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Setup Token'}
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return '✓';
      case 'expiring_soon': return '⚠';
      case 'expired': return '✗';
      default: return '?';
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Mavim Token Status</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Token'}
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-600 rounded text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tokenData?.status || 'unknown')}`}>
            {getStatusIcon(tokenData?.status || 'unknown')} {tokenData?.status || 'unknown'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Expires at:</span>
          <span className="font-mono">
            {tokenData?.expires_at ? formatTime(tokenData.expires_at) : 'N/A'}
          </span>
        </div>

        {!tokenData?.is_expired && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Time remaining:</span>
            <span className={tokenData?.minutes_until_expiry < 10 ? 'text-red-600 font-semibold' : ''}>
              {tokenData?.minutes_until_expiry} minutes
            </span>
          </div>
        )}

        {tokenData?.is_expired && (
          <div className="mt-2 p-2 bg-red-50 rounded">
            <p className="text-sm text-red-600">
              ⚠ Token has expired. Jobs may fail. Please refresh the token.
            </p>
          </div>
        )}

        {tokenData?.status === 'expiring_soon' && (
          <div className="mt-2 p-2 bg-yellow-50 rounded">
            <p className="text-sm text-yellow-700">
              ⚠ Token will expire soon. Consider refreshing it.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
            Advanced Info
          </summary>
          <div className="mt-2 space-y-1 text-xs font-mono">
            <div>Type: {tokenData?.token_type}</div>
            <div>Created: {tokenData?.timestamp ? formatTime(tokenData.timestamp) : 'N/A'}</div>
            <div>Expires in: {tokenData?.expires_in} seconds</div>
          </div>
        </details>
      </div>
    </div>
  );
}
```

### 3. Add Token Status to Dashboard

**Update `app/page.tsx`**
```typescript
'use client';

import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useAuth } from '@/components/AuthProvider';
import { CreateJobForm } from '@/components/CreateJobForm';
import { JobList } from '@/components/JobList';
import { TokenStatus } from '@/components/TokenStatus'; // Add this
import { useState } from 'react';

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();
  const { signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dutch Law Scraper</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Token Status - Full Width */}
        <TokenStatus />

        {/* Jobs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Job Form */}
          <div className="lg:col-span-1">
            <CreateJobForm
              onJobCreated={() => setRefreshKey(prev => prev + 1)}
            />
          </div>

          {/* Job List */}
          <div className="lg:col-span-2">
            <JobList key={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 4. Token Status Badge (Alternative Compact Version)

**`components/TokenBadge.tsx`** - Smaller version for header
```typescript
'use client';

import { useEffect, useState } from 'react';
import { tokenApi } from '@/lib/api';

export function TokenBadge() {
  const [status, setStatus] = useState<'valid' | 'expiring_soon' | 'expired' | 'loading'>('loading');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await tokenApi.getTokenStatus();
        if (result.success && result.data) {
          setStatus(result.data.status);
        }
      } catch (err) {
        setStatus('expired');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const colors = {
    valid: 'bg-green-500',
    expiring_soon: 'bg-yellow-500',
    expired: 'bg-red-500',
    loading: 'bg-gray-400',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
      <span className="text-sm text-gray-600">
        Mavim Token: {status === 'loading' ? 'Checking...' : status.replace('_', ' ')}
      </span>
    </div>
  );
}
```

---

## Example Code

### Auto-Refresh Job Details

```typescript
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Job } from '@/types/job';

export function JobDetails({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const result = await api.getJob(jobId);
        if (result.success && result.data) {
          setJob(result.data.job);
        }
      } catch (err) {
        console.error('Failed to fetch job:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();

    // Auto-refresh every 5 seconds if job is active
    const interval = setInterval(() => {
      if (job?.status === 'processing' || job?.status === 'pending' || job?.status === 'scraping') {
        fetchJob();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [jobId, job?.status]);

  if (loading) return <div>Loading...</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div>
      <h2>{job.searchInput}</h2>
      <p>Status: {job.status}</p>
      {/* ... more details ... */}
    </div>
  );
}
```

---

## Deployment

### 1. Build Next.js App

```bash
npm run build
```

### 2. Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

### 3. Or Deploy to Firebase Hosting

```bash
# Build for static export
npm run build

# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

---

## Security Notes

1. **Environment Variables**: Never commit `.env.local` to Git
2. **API Keys**: Use Firebase security rules to restrict access
3. **Authentication**: Always check `user` is authenticated before API calls
4. **CORS**: API already has CORS enabled
5. **Rate Limiting**: Consider implementing rate limiting on the client side

---

## Troubleshooting

### Firebase Auth Not Working
- Check Firebase config in `.env.local`
- Verify Firebase Authentication is enabled in console
- Check browser console for errors

### API Calls Failing
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check browser network tab for CORS errors
- Ensure API is deployed and running

### Jobs Not Updating
- Check auto-refresh interval (default: 10s)
- Verify job status is being returned from API
- Check browser console for errors

---

## Next Steps

1. **Add Real-time Updates**: Use Firebase Firestore `onSnapshot()` for real-time job updates
2. **Add Notifications**: Implement browser notifications when jobs complete
3. **Add Charts**: Show job statistics with charts (completed vs failed)
4. **Add Search**: Filter jobs by search input or date range
5. **Add Pagination**: Implement pagination for large job lists
6. **Add Admin Panel**: Create admin view to cleanup jobs and manage users

---

## Support

For issues or questions:
- Check logs: `npm run logs` (in functions directory)
- View Firebase Console: https://console.firebase.google.com/
- Test API endpoints with curl (see examples above)
