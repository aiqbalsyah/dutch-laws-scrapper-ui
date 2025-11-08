import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import axios from 'axios'
import { config } from '@/config'

const SCRAPER_API = config.apiBaseUrl

// POST /api/scraper/jobs/cleanup - Cleanup stuck jobs
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admins to cleanup jobs
    if (session.user.role !== 'administrator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const response = await axios.post(`${SCRAPER_API}/api/jobs/cleanup`, body)

    return NextResponse.json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { success: false, error: error.response?.data?.message || 'Failed to cleanup jobs' },
        { status: error.response?.status || 500 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
