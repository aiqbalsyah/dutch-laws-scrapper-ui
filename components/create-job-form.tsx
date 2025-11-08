'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { scraperApi } from '@/lib/api-client'
import { createJobSchema, CreateJobInput } from '@/lib/validations/job-schemas'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface CreateJobFormProps {
  onJobCreated?: (jobId: string) => void
}

interface PreviewData {
  searchTerm: string
  totalLaws: number
  willProcess: number
  laws: Array<{
    title: string
    identifier: string
    articleCount?: number | null
  }>
}

export function CreateJobForm({ onJobCreated }: CreateJobFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [pendingJobData, setPendingJobData] = useState<CreateJobInput | null>(null)
  const [selectedLaws, setSelectedLaws] = useState<Set<string>>(new Set())
  const { data: session } = useSession()

  const form = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      searchInput: '',
      maxLaws: '',
      email: session?.user?.email || '',
    },
  })

  const onSubmit = async (data: CreateJobInput) => {
    setError('')
    setIsLoading(true)

    try {
      // First, get preview
      const preview = await scraperApi.previewJob({
        searchInput: data.searchInput,
        maxLaws: data.maxLaws === '' ? undefined : Number(data.maxLaws),
      })

      if (preview.success && preview.data) {
        // Show preview dialog and select all laws by default
        setPreviewData(preview.data)
        setPendingJobData(data)
        const allIdentifiers = new Set(preview.data.laws.map(law => law.identifier))
        setSelectedLaws(allIdentifiers)
        setShowPreview(true)
      } else {
        setError(preview.message || 'Failed to fetch preview')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleLawSelection = (identifier: string) => {
    setSelectedLaws(prev => {
      const newSet = new Set(prev)
      if (newSet.has(identifier)) {
        newSet.delete(identifier)
      } else {
        newSet.add(identifier)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (!previewData) return

    if (selectedLaws.size === previewData.laws.length) {
      // Deselect all
      setSelectedLaws(new Set())
    } else {
      // Select all
      const allIdentifiers = new Set(previewData.laws.map(law => law.identifier))
      setSelectedLaws(allIdentifiers)
    }
  }

  const handleConfirmJob = async () => {
    if (!pendingJobData || selectedLaws.size === 0 || !previewData) return

    setShowPreview(false)
    setIsLoading(true)
    setError('')

    try {
      // Get full law data for selected identifiers
      const selectedLawData = previewData.laws
        .filter(law => selectedLaws.has(law.identifier))
        .map(law => ({
          title: law.title,
          identifier: law.identifier,
          articleCount: law.articleCount,
        }))

      const result = await scraperApi.createJob({
        searchInput: pendingJobData.searchInput,
        maxLaws: pendingJobData.maxLaws === '' ? undefined : Number(pendingJobData.maxLaws),
        email: pendingJobData.email === '' ? undefined : pendingJobData.email,
        selectedIdentifiers: Array.from(selectedLaws),
        selectedLaws: selectedLawData,
      })

      if (result.success && result.data) {
        const jobId = result.data.jobId
        form.reset()
        setPreviewData(null)
        setPendingJobData(null)
        setSelectedLaws(new Set())
        onJobCreated?.(jobId)
      } else {
        setError(result.message || result.error || 'Failed to create job')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Job</CardTitle>
        <CardDescription>
          Start a new automation job
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="searchInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Law Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Aanbestedingswet 2012"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the name of the Dutch law
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxLaws"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Laws (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Leave empty for all"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of laws to process
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Receive notifications when job completes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Loading Preview...' : 'Preview Job'}
            </Button>
          </form>
        </Form>
      </CardContent>

      {/* Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Preview: "{previewData?.searchTerm}"</AlertDialogTitle>
            <AlertDialogDescription>
              Found {previewData?.totalLaws} law{previewData?.totalLaws !== 1 ? 's' : ''}.
              {selectedLaws.size} selected.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Select laws to scrape:</div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
                {selectedLaws.size === previewData?.laws.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2 rounded-md border p-4">
              {previewData?.laws.map((law, index) => (
                <div key={law.identifier} className="flex items-start gap-3 text-sm hover:bg-accent/50 p-2 rounded-md">
                  <Checkbox
                    id={`law-${law.identifier}`}
                    checked={selectedLaws.has(law.identifier)}
                    onCheckedChange={() => toggleLawSelection(law.identifier)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`law-${law.identifier}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{index + 1}. {law.title}</span>
                      {law.articleCount != null && (
                        <span className="text-xs text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded">
                          {law.articleCount} {law.articleCount === 1 ? 'article' : 'articles'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{law.identifier}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowPreview(false)
              setPreviewData(null)
              setPendingJobData(null)
              setSelectedLaws(new Set())
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmJob}
              disabled={isLoading || selectedLaws.size === 0}
            >
              {isLoading ? 'Creating...' : `Create Job (${selectedLaws.size} law${selectedLaws.size !== 1 ? 's' : ''})`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
