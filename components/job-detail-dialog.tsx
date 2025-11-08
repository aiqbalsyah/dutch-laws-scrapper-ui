'use client'

import { useEffect, useState } from 'react'
import { Job } from '@/types/job'
import { scraperApi } from '@/lib/api-client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow, format } from 'date-fns'

interface JobDetailDialogProps {
  jobId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JobDetailDialog({ jobId, open, onOpenChange }: JobDetailDialogProps) {
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && jobId) {
      fetchJobDetails()
    }
  }, [open, jobId])

  const fetchJobDetails = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await scraperApi.getJob(jobId)

      if (result.success && result.job) {
        setJob(result.job)
      } else {
        setError(result.message || 'Failed to fetch job details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job details')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'processing':
      case 'scraping':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A'
    try {
      return format(new Date(dateStr), 'PPpp')
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{job?.searchInput || 'Job Details'}</DialogTitle>
              <DialogDescription className="font-mono text-xs mt-1">
                ID: {jobId}
              </DialogDescription>
            </div>
            {job && (
              <Badge variant={getStatusVariant(job.status)} className="shrink-0">
                {job.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="py-8 text-center text-muted-foreground">Loading job details...</div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {job && !isLoading && (
          <div className="space-y-4">
            {/* Status Information */}
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Message:</span>
                  <span className="font-medium">{job.statusMessage}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Job Configuration */}
            <div>
              <h3 className="font-semibold mb-2">Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Search Input:</span>
                  <span className="font-medium">{job.searchInput}</span>
                </div>
                {job.maxLaws && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Laws:</span>
                    <span className="font-medium">{job.maxLaws}</span>
                  </div>
                )}
                {job.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email Notification:</span>
                    <span className="font-medium font-mono text-xs">{job.email}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Processing Statistics */}
            <div>
              <h3 className="font-semibold mb-2">Processing Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Total Laws</span>
                  <span className="font-semibold text-lg">{job.totalLaws}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Scraped Laws</span>
                  <span className="font-semibold text-lg">{job.scrapedLaws}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Processed Laws</span>
                  <span className="font-semibold text-lg">{job.processedLaws}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Processed Paragraphs</span>
                  <span className="font-semibold text-lg">{job.processedParagraphs}</span>
                </div>
              </div>
            </div>

            {job.currentLaw && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Current Processing</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Law:</span>
                      <span className="font-medium">{job.currentLaw}</span>
                    </div>
                    {job.currentLawTopicId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Topic ID:</span>
                        <span className="font-mono text-xs">{job.currentLawTopicId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Timestamps */}
            <div>
              <h3 className="font-semibold mb-2">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-mono text-xs">
                    {formatDate(job.createdAt)}
                    <span className="text-muted-foreground ml-2">
                      ({formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-mono text-xs">
                    {formatDate(job.updatedAt)}
                    <span className="text-muted-foreground ml-2">
                      ({formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })})
                    </span>
                  </span>
                </div>
                {job.startedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started:</span>
                    <span className="font-mono text-xs">
                      {formatDate(job.startedAt)}
                      <span className="text-muted-foreground ml-2">
                        ({formatDistanceToNow(new Date(job.startedAt), { addSuffix: true })})
                      </span>
                    </span>
                  </div>
                )}
                {job.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-mono text-xs">
                      {formatDate(job.completedAt)}
                      <span className="text-muted-foreground ml-2">
                        ({formatDistanceToNow(new Date(job.completedAt), { addSuffix: true })})
                      </span>
                    </span>
                  </div>
                )}
                {job.failedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Failed:</span>
                    <span className="font-mono text-xs">
                      {formatDate(job.failedAt)}
                      <span className="text-muted-foreground ml-2">
                        ({formatDistanceToNow(new Date(job.failedAt), { addSuffix: true })})
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Laws Preview */}
            {job.options?.selectedLaws && job.options.selectedLaws.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">
                    Laws to Scrape ({job.options.selectedLaws.length})
                  </h3>
                  <div className="max-h-48 overflow-y-auto border rounded-md p-3 bg-muted/30">
                    <ul className="space-y-1.5 text-sm">
                      {job.options.selectedLaws.map((law, i) => (
                        <li key={law.identifier} className="flex flex-col gap-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">
                              {i + 1}. {law.title}
                            </span>
                            {law.articleCount != null && (
                              <span className="text-xs text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded">
                                {law.articleCount} {law.articleCount === 1 ? 'article' : 'articles'}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            {law.identifier}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* Processed Law Titles */}
            {job.processedLawTitles.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">
                    Processed Laws ({job.processedLawTitles.length})
                  </h3>
                  <div className="max-h-48 overflow-y-auto border rounded-md p-3">
                    <ul className="space-y-1 text-sm">
                      {job.processedLawTitles.map((title, i) => (
                        <li key={i} className="text-muted-foreground">
                          {i + 1}. {title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* Errors */}
            {job.errors.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2 text-destructive">
                    Errors ({job.errors.length})
                  </h3>
                  <Alert variant="destructive">
                    <AlertDescription>
                      <div className="max-h-48 overflow-y-auto">
                        <ul className="space-y-2">
                          {job.errors.map((err, i) => (
                            <li key={i} className="text-xs">
                              {err.node && <span className="font-semibold">{err.node}: </span>}
                              {err.error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
