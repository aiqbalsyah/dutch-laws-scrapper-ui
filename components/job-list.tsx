'use client'

import { useEffect, useState } from 'react'
import { Job, JobStatus } from '@/types/job'
import { scraperApi } from '@/lib/api-client'
import { JobCard } from './job-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const fetchJobs = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await scraperApi.getAllJobs({
        status: filter === 'all' ? undefined : filter,
        limit: 50,
      })

      if (result.success && result.jobs) {
        setJobs(result.jobs)
      } else {
        setError(result.message || 'Failed to fetch jobs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [filter])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Jobs</h2>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="scraping">Scraping</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No jobs found</div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <JobCard key={job.jobId} job={job} onUpdate={fetchJobs} />
          ))}
        </div>
      )}
    </div>
  )
}
