'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return null // Will redirect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
            Procestoppers
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            App Automations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Management</CardTitle>
              <CardDescription>
                Create and monitor automation jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Queue multiple jobs, track progress in real-time, and manage failed tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mavim Integration</CardTitle>
              <CardDescription>
                Seamless integration with Mavim API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Automatic token management and direct publishing to Mavim topics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Real-time Updates</CardTitle>
              <CardDescription>
                Live progress tracking and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Monitor job status, paragraph processing, and completion in real-time
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => router.push('/auth/sign-in')}
            size="lg"
            className="w-full sm:w-auto"
          >
            Sign In
          </Button>
        </div>

        <p className="text-center mt-6 text-sm text-zinc-500 dark:text-zinc-500">
          Contact your administrator for access
        </p>
      </div>
    </div>
  )
}
