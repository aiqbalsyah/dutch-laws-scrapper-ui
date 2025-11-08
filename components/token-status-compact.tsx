'use client'

import { useEffect, useState } from 'react'
import { tokenApi } from '@/lib/api-client'
import { TokenStatus as TokenStatusType } from '@/types/job'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function TokenStatusCompact() {
  const [tokenData, setTokenData] = useState<TokenStatusType | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const fetchTokenStatus = async () => {
    try {
      const result = await tokenApi.getTokenStatus()

      if (result.success && result.data) {
        setTokenData(result.data)
      } else {
        setError(result.message || 'No token found')
        setTokenData(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token status')
      setTokenData(null)
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
        setTimeout(() => setShowSuccess(false), 5000)
      } else {
        const errorMsg = result.message || result.error || 'Failed to refresh token'
        setError(errorMsg)
        setErrorDetails(result)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error'
      setError(errorMsg)
      setErrorDetails(err)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTokenStatus()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-500 dark:bg-green-600'
      case 'expiring_soon':
        return 'bg-yellow-500 dark:bg-yellow-600'
      case 'expired':
        return 'bg-red-500 dark:bg-red-600'
      default:
        return 'bg-zinc-400 dark:bg-zinc-600'
    }
  }

  const getStatusText = () => {
    if (!tokenData) return 'No Token'
    if (tokenData.is_expired) return 'Expired'
    if (tokenData.status === 'expiring_soon') return `${tokenData.minutes_until_expiry}m left`
    return `${tokenData.minutes_until_expiry}m`
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getStatusColor(tokenData?.status || 'unknown')}`} />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Mavim Token
            </span>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {getStatusText()}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Token Status</h4>
              <Badge variant={tokenData?.is_expired ? 'destructive' : 'default'} className="text-xs">
                {tokenData?.status || 'unknown'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              OAuth token for Mavim API integration
            </p>
          </div>

          {showSuccess && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <AlertDescription className="text-green-700 dark:text-green-300 text-xs">
                ✓ Token refreshed successfully!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                <p className="font-medium">{error}</p>
                {errorDetails && (
                  <div className="mt-2">
                    <button
                      onClick={() => setShowErrorDetails(!showErrorDetails)}
                      className="text-xs underline hover:no-underline"
                    >
                      {showErrorDetails ? 'Hide' : 'Show'} details
                    </button>
                    {showErrorDetails && (
                      <div className="mt-2 p-2 bg-black/10 rounded border border-white/20 overflow-auto max-h-48">
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

          {tokenData && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires:</span>
                <span className="font-medium">
                  {tokenData.is_expired ? 'Expired' : `${tokenData.minutes_until_expiry} minutes`}
                </span>
              </div>
              {tokenData.is_expired && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-xs">
                    Token expired. Jobs will fail until refreshed.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            className="w-full"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
