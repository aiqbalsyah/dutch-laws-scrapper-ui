import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import axios from 'axios'
import { config } from '@/config'

const SCRAPER_API = config.apiBaseUrl

// POST /api/scraper/token/refresh - Refresh token via ROPC (one-click)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admins to refresh token
    if (session.user.role !== 'administrator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Call the ROPC endpoint (uses stored credentials on backend)
    const response = await axios.post(`${SCRAPER_API}/api/oauth/ropc`, {})

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Token refresh error:', error)

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || {}
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Failed to refresh token',
          message: errorData.message || error.message,
          details: errorData
        },
        { status: error.response?.status || 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
