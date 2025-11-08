import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import axios from 'axios'
import { config } from '@/config'

const SCRAPER_API = config.apiBaseUrl

// POST /api/scraper/jobs/preview - Preview laws before creating job
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const response = await axios.post(`${SCRAPER_API}/api/scrape-preview`, body)
    return NextResponse.json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { success: false, error: error.response?.data?.message || 'Failed to fetch preview' },
        { status: error.response?.status || 500 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
