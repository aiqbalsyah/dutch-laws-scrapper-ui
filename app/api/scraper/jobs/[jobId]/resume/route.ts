import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import axios from 'axios'
import { config } from '@/config'

const SCRAPER_API = config.apiBaseUrl

// POST /api/scraper/jobs/[jobId]/resume - Resume job
export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await axios.post(`${SCRAPER_API}/api/jobs/${params.jobId}/resume`)
    return NextResponse.json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { success: false, error: error.response?.data?.message || 'Failed to resume job' },
        { status: error.response?.status || 500 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
