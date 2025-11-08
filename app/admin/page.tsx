'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CreateJobForm } from '@/components/create-job-form'
import { JobList } from '@/components/job-list'
import { TokenStatus } from '@/components/token-status'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in')
    } else if (status === 'authenticated' && session?.user?.role !== 'administrator') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'administrator') {
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Dutch Law Scraper
              </h1>
              <Badge variant="secondary">Admin</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {session.user?.email}
              </div>
              <Button
                onClick={() => signOut({ callbackUrl: '/auth/sign-in' })}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
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
  )
}
