import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import axios from 'axios'
import { config } from '@/config'

const SCRAPER_API = config.apiBaseUrl

// GET /api/scraper/jobs - Get all jobs
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const params = {
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') || undefined,
    }

    const response = await axios.get(`${SCRAPER_API}/api/jobs`, { params })
    return NextResponse.json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { success: false, error: error.response?.data?.message || 'Failed to fetch jobs' },
        { status: error.response?.status || 500 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/scraper/jobs - Create new job
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const response = await axios.post(`${SCRAPER_API}/api/scrape-to-mavim`, body)

    return NextResponse.json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { success: false, error: error.response?.data?.message || 'Failed to create job' },
        { status: error.response?.status || 500 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
