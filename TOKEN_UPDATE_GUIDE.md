# Token Management UI Update

## Overview
This document describes the token management functionality added to the Dutch Law Scraper UI.

## What Was Added

### 1. Backend API Endpoint
**File:** `api-transforms/functions/server.js` (Line 2029-2108)

A new endpoint was created to save manually obtained access tokens:
- **Endpoint:** `POST /api/oauth/access-token`
- **Purpose:** Save access tokens obtained via ROPC (Resource Owner Password Credentials) flow
- **Usage:** Accepts `access_token`, `token_type`, `expires_in`, and `scope`

### 2. UI Components

#### A. API Route Handler
**File:** `app/api/scraper/token/save/route.ts`

Next.js API route that proxies requests to the backend scraper API:
- Authenticates users (requires admin role)
- Validates input
- Forwards request to backend API

#### B. API Client Function
**File:** `lib/api-client.ts` (Line 48-56)

Added `saveAccessToken()` function to tokenApi:
```typescript
async saveAccessToken(data: {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string
}): Promise<ApiResponse<TokenStatus>>
```

#### C. Token Status Component
**File:** `components/token-status.tsx`

Enhanced the existing token status component with:
- **Manual Token Input Section** - Collapsible section for manual token updates
- **ROPC Instructions** - Displays the curl command to get tokens
- **Form Fields:**
  - Access Token textarea (for pasting long token strings)
  - Expires In input (with default 4329 seconds)
- **Save/Cancel buttons**
- **Success/Error feedback**

#### D. UI Components
**File:** `components/ui/textarea.tsx`

Created a new Textarea component following shadcn/ui patterns.

## How to Use

### Option 1: Using the UI (Recommended)

1. **Navigate to the Dashboard** where the Token Status card is displayed
2. **Expand "Manual Token Update (ROPC)"** section
3. **Get a fresh token** using the curl command shown:
   ```bash
   curl --location 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token' \
     --header 'Content-Type: application/x-www-form-urlencoded' \
     --data-urlencode 'client_id=15e1f0d0-3141-47b0-a87e-323d62b71b75' \
     --data-urlencode 'scope=https://adapps.mavimcloud.com/mavim/Mavim.iMprove.ReadWrite.All' \
     --data-urlencode 'username=operations@procestoppers.nl' \
     --data-urlencode 'password=YOUR_PASSWORD' \
     --data-urlencode 'grant_type=password'
   ```
4. **Copy the `access_token`** and `expires_in` from the JSON response
5. **Paste into the form** and click "Save Access Token"
6. **Token status will update** automatically

### Option 2: Using Direct API Call

```bash
curl -X POST https://scraper-nzsuxiw5eq-uc.a.run.app/api/oauth/access-token \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "YOUR_TOKEN_HERE",
    "token_type": "Bearer",
    "expires_in": 4329,
    "scope": "https://adapps.mavimcloud.com/mavim/Mavim.iMprove.ReadWrite.All"
  }'
```

## Key Features

### 1. Token Expiration Tracking
- Shows exact expiration time
- Visual indicators (green = valid, yellow = expiring soon, red = expired)
- Auto-refresh every 30 seconds

### 2. Multiple Refresh Methods
- **Automatic Refresh:** Uses stored refresh token (if available)
- **Manual ROPC:** Direct username/password authentication
- **Token Save:** Manually paste tokens from external sources

### 3. Security
- Admin-only access for token management
- Tokens never displayed in UI
- Secure storage on backend

### 4. Error Handling
- Detailed error messages
- Expandable error details for debugging
- Clear success feedback

## Technical Details

### ROPC Flow
The ROPC (Resource Owner Password Credentials) flow:
- Authenticates directly with username/password
- Returns `access_token` (but NO `refresh_token`)
- Token lasts ~72 minutes (4329 seconds)
- Must re-authenticate when expired

### Comparison: ROPC vs Refresh Token

| Feature | ROPC Flow | Refresh Token Flow |
|---------|-----------|-------------------|
| Returns refresh token | ❌ No | ✅ Yes |
| Auto-renewable | ❌ No | ✅ Yes |
| Requires credentials | ✅ Yes | ❌ No |
| Duration | ~72 min | Can extend |
| Use case | Manual updates | Automated systems |

## Files Modified

### Backend (api-transforms)
- `functions/server.js` - Added POST /api/oauth/access-token endpoint

### Frontend (dutch-law-scraper-ui)
- `app/api/scraper/token/save/route.ts` - New API route
- `lib/api-client.ts` - Added saveAccessToken function
- `components/token-status.tsx` - Enhanced with manual input
- `components/ui/textarea.tsx` - New component

## Testing

To test the implementation:

1. **Start the UI development server:**
   ```bash
   cd dutch-law-scraper-ui
   pnpm dev
   ```

2. **Login as admin user**

3. **Navigate to Dashboard**

4. **Check Token Status card:**
   - Should show current token status
   - Refresh button should work
   - Manual Token Update section should be visible

5. **Test Manual Token Input:**
   - Click "Manual Token Update (ROPC)"
   - Paste a valid access token
   - Click "Save Access Token"
   - Verify token status updates

## Troubleshooting

### Token Save Fails
- **Check:** User is logged in as administrator
- **Check:** Access token is valid and not expired
- **Check:** Backend API is accessible

### UI Not Showing Manual Input
- **Check:** Textarea component was created
- **Check:** No TypeScript errors
- **Check:** Component imports are correct

### ROPC Authentication Fails
- **Check:** Using `/organizations` endpoint (not `/common`)
- **Check:** Username and password are correct
- **Check:** Client ID matches Azure AD app

## Future Enhancements

Potential improvements:
1. **Auto-refresh via ROPC** - Store credentials securely and auto-refresh
2. **Token history** - Show past tokens and their lifetimes
3. **Notification system** - Alert when token is about to expire
4. **Multi-environment support** - Different tokens for dev/staging/prod

## Support

For issues or questions:
- Check logs: `npm run logs` in functions directory
- Check browser console for frontend errors
- Verify API responses using curl commands above
