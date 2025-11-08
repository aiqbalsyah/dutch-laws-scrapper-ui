'use client'

import { useEffect, useState } from 'react'
import { tokenApi } from '@/lib/api-client'
import { TokenStatus as TokenStatusType } from '@/types/job'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'

export function TokenStatus() {
  const [tokenData, setTokenData] = useState<TokenStatusType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)


  const fetchTokenStatus = async () => {
    setError('')

    try {
      const result = await tokenApi.getTokenStatus()

      // API returns { success: true, data: { token data... } }
      if (result.success && result.data) {
        setTokenData(result.data)
      } else {
        setError(result.message || 'No token found')
        setTokenData(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token status')
      setTokenData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError('')
    setErrorDetails(null)
    setShowSuccess(false)

    try {
      const result = await tokenApi.refreshToken()

      if (result.success) {
        await fetchTokenStatus()
        setShowSuccess(true)

        // Auto-hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000)
      } else {
        // Show detailed error message from API
        const errorMsg = result.message || result.error || 'Failed to refresh token'
        setError(errorMsg)
        setErrorDetails(result)
        console.error('Token refresh error:', result)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error'
      setError(errorMsg)
      setErrorDetails(err)
      console.error('Token refresh error:', err)
    } finally {
      setIsRefreshing(false)
    }
  }


  useEffect(() => {
    fetchTokenStatus()
  }, [])

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'valid':
        return 'default'
      case 'expiring_soon':
        return 'secondary'
      case 'expired':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return '✓'
      case 'expiring_soon':
        return '⚠'
      case 'expired':
        return '✗'
      default:
        return '?'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Loading token status...</p>
        </CardContent>
      </Card>
    )
  }

  if (error && !tokenData) {
    const isNoTokenError = error.includes('No token') || error.includes('not found')

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-destructive">Token Error</CardTitle>
              <CardDescription className="mt-2">{error}</CardDescription>
            </div>
            {!isNoTokenError && (
              <Button onClick={handleRefresh} disabled={isRefreshing} size="sm">
                {isRefreshing ? 'Refreshing...' : 'Retry'}
              </Button>
            )}
          </div>
        </CardHeader>
        {isNoTokenError && (
          <CardContent>
            <Alert>
              <AlertDescription>
                <p className="font-medium mb-2">Initial Setup Required</p>
                <p className="text-sm text-muted-foreground">
                  The Mavim OAuth token needs to be initialized on the scraper API server.
                  Please contact the system administrator to configure the refresh token in the backend.
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mavim Token Status</CardTitle>
            <CardDescription>OAuth token for Mavim API integration</CardDescription>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSuccess && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <AlertDescription className="text-green-700 dark:text-green-300">
              <p className="font-medium">✓ Token Refreshed Successfully!</p>
              <p className="text-sm mt-1">
                Your Mavim access token has been renewed and will expire in ~{tokenData?.minutes_until_expiry} minutes.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              <p className="font-medium mb-1">Error</p>
              <p className="text-sm mb-2">{error}</p>
              {errorDetails && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowErrorDetails(!showErrorDetails)}
                    className="text-xs underline hover:no-underline"
                  >
                    {showErrorDetails ? 'Hide' : 'Show'} detailed error information
                  </button>
                  {showErrorDetails && (
                    <div className="mt-2 p-3 bg-black/10 rounded border border-white/20 overflow-auto">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {JSON.stringify(errorDetails, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={getStatusVariant(tokenData?.status || 'unknown')}>
              {getStatusIcon(tokenData?.status || 'unknown')} {tokenData?.status || 'unknown'}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expires:</span>
            <span className="font-mono">
              {tokenData?.expires_at
                ? formatDistanceToNow(new Date(tokenData.expires_at), { addSuffix: true })
                : 'N/A'}
            </span>
          </div>

          {tokenData && !tokenData.is_expired && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time remaining:</span>
              <span className={tokenData.minutes_until_expiry < 10 ? 'text-destructive font-semibold' : ''}>
                {tokenData.minutes_until_expiry} minutes
              </span>
            </div>
          )}
        </div>

        {tokenData?.is_expired && (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium mb-1">⚠ Token Expired</p>
                  <p className="text-sm">
                    The Mavim OAuth token has expired {Math.abs(tokenData.minutes_until_expiry)} minutes ago.
                    New scraping jobs will fail until the token is refreshed.
                  </p>
                </div>
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {tokenData?.status === 'expiring_soon' && !tokenData.is_expired && (
          <Alert>
            <AlertDescription>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium mb-1">⚠ Token Expiring Soon</p>
                  <p className="text-sm text-muted-foreground">
                    The token will expire in {tokenData.minutes_until_expiry} minutes.
                    Consider refreshing it to avoid job interruptions.
                  </p>
                </div>
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDetails ? '▼' : '▶'} Advanced Info
          </button>

          {showDetails && tokenData && (
            <div className="mt-3 space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span>{tokenData.token_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>
                  {tokenData.timestamp
                    ? formatDistanceToNow(new Date(tokenData.timestamp), { addSuffix: true })
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires in:</span>
                <span>{tokenData.expires_in} seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Has access token:</span>
                <span>{tokenData.has_access_token ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Has refresh token:</span>
                <span>{tokenData.has_refresh_token ? 'Yes' : 'No'}</span>
              </div>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
