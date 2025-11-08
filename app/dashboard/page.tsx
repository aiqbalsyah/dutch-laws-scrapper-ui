'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CreateJobForm } from '@/components/create-job-form'
import { JobList } from '@/components/job-list'
import { TokenStatusCompact } from '@/components/token-status-compact'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/95 dark:supports-[backdrop-filter]:bg-zinc-900/60">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50">
                <span className="text-sm font-bold text-white dark:text-zinc-900">PA</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Procestoppers
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">App Automations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <TokenStatusCompact />
              <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
              <div className="text-sm">
                <div className="font-medium text-zinc-900 dark:text-zinc-50">{session.user?.name || 'User'}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{session.user?.email}</div>
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
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area - Job List */}
          <div className="flex-1 min-w-0">
            <JobList key={refreshKey} />
          </div>

          {/* Sticky Sidebar */}
          <aside className="w-full lg:w-96 shrink-0">
            <div className="sticky top-24">
              {/* Create Job Form */}
              <CreateJobForm
                onJobCreated={() => setRefreshKey(prev => prev + 1)}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
