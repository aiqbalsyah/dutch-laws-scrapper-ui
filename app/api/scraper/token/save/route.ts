import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import axios from 'axios'
import { config } from '@/config'

const SCRAPER_API = config.apiBaseUrl

// POST /api/scraper/token/save - Save manually obtained access token
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admins to save tokens
    if (session.user.role !== 'administrator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { access_token, token_type, expires_in, scope } = body

    if (!access_token) {
      return NextResponse.json(
        { success: false, error: 'access_token is required' },
        { status: 400 }
      )
    }

    const response = await axios.post(`${SCRAPER_API}/api/oauth/access-token`, {
      access_token,
      token_type: token_type || 'Bearer',
      expires_in: expires_in || 3600,
      scope: scope || 'https://adapps.mavimcloud.com/mavim/Mavim.iMprove.ReadWrite.All',
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Token save error:', error)

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data || {}
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Failed to save token',
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
