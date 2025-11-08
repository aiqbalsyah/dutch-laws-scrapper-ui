'use client'

import { useState } from 'react'
import { Job } from '@/types/job'
import { scraperApi } from '@/lib/api-client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatDistanceToNow } from 'date-fns'
import { JobDetailDialog } from './job-detail-dialog'

interface JobCardProps {
  job: Job
  onUpdate?: () => void
}

export function JobCard({ job, onUpdate }: JobCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowCancelDialog(true)
  }

  const handleCancelConfirm = async () => {
    setIsLoading(true)
    setShowCancelDialog(false)
    try {
      await scraperApi.cancelJob(job.jobId)
      setSuccessMessage('Job cancelled successfully')
      setShowSuccessAlert(true)
      setTimeout(() => setShowSuccessAlert(false), 5000)
      onUpdate?.()
    } catch (err) {
      setErrorMessage('Failed to cancel job. Please try again.')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResume = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    try {
      await scraperApi.resumeJob(job.jobId)
      setSuccessMessage('Job resumed successfully')
      setShowSuccessAlert(true)
      setTimeout(() => setShowSuccessAlert(false), 5000)
      onUpdate?.()
    } catch (err) {
      setErrorMessage('Failed to resume job. Please try again.')
      setShowErrorAlert(true)
      setTimeout(() => setShowErrorAlert(false), 5000)
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
      case 'cancelled':
        return 'outline'
      case 'processing':
      case 'scraping':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Calculate progress based on processed laws (more accurate than paragraph count)
  const progress = job.totalLaws > 0
    ? Math.round((job.processedLaws / job.totalLaws) * 100)
    : 0

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowDetails(true)}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{job.searchInput}</h3>
              <p className="text-sm text-muted-foreground">ID: {job.jobId}</p>
            </div>
            <Badge variant={getStatusVariant(job.status)} className="ml-2">
              {job.status}
            </Badge>
          </div>
        </CardHeader>
      <CardContent className="space-y-4">
        {showSuccessAlert && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <AlertDescription className="text-green-700 dark:text-green-300">
              ✓ {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {showErrorAlert && (
          <Alert variant="destructive">
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span className="text-muted-foreground">{job.statusMessage}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Created:</span>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </span>
          </div>

          {job.options?.selectedLaws && job.options.selectedLaws.length > 0 && (
            <div className="flex justify-between">
              <span className="font-medium">Selected Laws:</span>
              <span className="text-muted-foreground">{job.options.selectedLaws.length} law{job.options.selectedLaws.length !== 1 ? 's' : ''}</span>
            </div>
          )}

          {job.status === 'processing' && (
            <>
              {job.currentLaw && (
                <div className="flex justify-between">
                  <span className="font-medium">Current Law:</span>
                  <span className="text-muted-foreground truncate ml-2">{job.currentLaw}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="font-medium">Laws:</span>
                <span className="text-muted-foreground">
                  {job.processedLaws} / {job.totalLaws} completed
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Paragraphs:</span>
                <span className="text-muted-foreground">{job.processedParagraphs} processed</span>
              </div>

              {job.totalLaws > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Law Progress</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} />
                </div>
              )}
            </>
          )}

          {job.status === 'completed' && (
            <>
              {job.completedAt && (
                <div className="flex justify-between">
                  <span className="font-medium">Completed:</span>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(job.completedAt), { addSuffix: true })}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="font-medium">Total Paragraphs:</span>
                <span className="text-muted-foreground">{job.processedParagraphs}</span>
              </div>
            </>
          )}

          {job.status === 'failed' && job.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <p className="font-medium mb-1">Errors:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {job.errors.slice(0, 3).map((err, i) => (
                    <li key={i} className="text-xs">
                      {err.node && `${err.node}: `}{err.error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-2">
          {(job.status === 'processing' || job.status === 'pending') && (
            <Button
              onClick={handleCancelClick}
              disabled={isLoading}
              variant="destructive"
              size="sm"
            >
              Cancel
            </Button>
          )}

          {job.status === 'paused' && (
            <Button
              onClick={handleResume}
              disabled={isLoading}
              variant="default"
              size="sm"
            >
              Resume
            </Button>
          )}
        </div>
      </CardContent>
    </Card>

    <JobDetailDialog
      jobId={job.jobId}
      open={showDetails}
      onOpenChange={setShowDetails}
    />

    <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Job?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this job for &quot;{job.searchInput}&quot;?
            This action cannot be undone. All progress will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, keep running</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancelConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Yes, cancel job
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
