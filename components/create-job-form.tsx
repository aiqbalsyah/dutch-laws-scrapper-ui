'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { scraperApi } from '@/lib/api-client'
import { createJobSchema, CreateJobInput } from '@/lib/validations/job-schemas'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  onJobCreated?: () => void
}

export function CreateJobForm({ onJobCreated }: CreateJobFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
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
      const result = await scraperApi.createJob({
        searchInput: data.searchInput,
        maxLaws: data.maxLaws === '' ? undefined : Number(data.maxLaws),
        email: data.email === '' ? undefined : data.email,
      })

      if (result.success) {
        form.reset()
        onJobCreated?.()
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
          Start a new Dutch law scraping job
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
                    Enter the name of the Dutch law to scrape
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
              {isLoading ? 'Creating...' : 'Create Job'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
