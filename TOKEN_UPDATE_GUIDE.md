# Token Management UI Update - ONE-CLICK REFRESH

## Overview
This document describes the **one-click token refresh** functionality for the Dutch Law Scraper UI.

## What Was Added

### 1. Backend API Endpoint - One-Click ROPC Authentication
**File:** `api-transforms/functions/server.js` (Line 2029-2146)

A new endpoint that handles complete ROPC authentication and token storage in one request:
- **Endpoint:** `POST /api/oauth/ropc`
- **Purpose:** Authenticate via ROPC and automatically save the token
- **Credentials:** Stored securely in backend (no user input required)
- **Usage:** Simply POST to endpoint with empty body `{}`

**Key Features:**
- Default credentials stored in backend code
- Automatic Microsoft OAuth authentication
- Automatic token storage
- Returns token metadata (not the actual token)

### 2. UI Components

#### A. API Route Handler
**File:** `app/api/scraper/token/refresh/route.ts`

Updated the refresh route to use ROPC:
- Calls the backend ROPC endpoint
- No parameters required
- Returns success/error status

#### B. Token Status Component
**File:** `components/token-status.tsx`

Simplified token status component:
- **One-Click Refresh Button** - Just click "Refresh Token"
- No manual input required
- No forms, no copy/paste
- Automatic authentication and save

## How to Use

### Option 1: Using the UI (Recommended) - **ONE CLICK!**

1. **Navigate to the Dashboard** where the Token Status card is displayed
2. **Click the "Refresh Token" button**
3. **Done!** Token is automatically refreshed

That's it! The system:
- Authenticates with Microsoft using stored credentials
- Gets a fresh access token
- Saves it automatically
- Updates the status display

### Option 2: Using Direct API Call

```bash
curl -X POST https://scraper-nzsuxiw5eq-uc.a.run.app/api/oauth/ropc \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful and token saved",
  "data": {
    "token_type": "Bearer",
    "scope": "https://adapps.mavimcloud.com/mavim/Mavim.iMprove.ReadWrite.All",
    "expires_in": 4690,
    "timestamp": "2025-11-08T07:16:45.555Z",
    "expires_at": "2025-11-08T08:34:55.705Z",
    "minutes_until_expiry": 78,
    "status": "valid"
  }
}
```

## Key Features

### 1. **ONE-CLICK Refresh** ⭐
- Single button click to refresh token
- No credentials needed (stored in backend)
- Automatic authentication and save
- ~78 minute token lifetime

### 2. Token Expiration Tracking
- Shows exact expiration time
- Visual indicators (green = valid, yellow = expiring soon, red = expired)
- Auto-refresh status every 30 seconds

### 3. Security
- Admin-only access for token management
- Credentials stored securely in backend code
- Tokens never displayed in UI
- Secure OAuth ROPC flow

### 4. Error Handling
- Detailed error messages from Microsoft OAuth
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
- `functions/server.js` (Line 2029-2146) - Added POST /api/oauth/ropc endpoint
  - Stores credentials securely
  - Authenticates via Microsoft ROPC
  - Automatically saves token

### Frontend (dutch-law-scraper-ui)
- `app/api/scraper/token/refresh/route.ts` - Updated to call ROPC endpoint
- `components/token-status.tsx` - Simplified (removed manual input UI)
- `lib/api-client.ts` - Uses existing refreshToken() function

## Testing

### Test via API (Fastest)

```bash
# Test ROPC endpoint directly
curl -X POST https://scraper-nzsuxiw5eq-uc.a.run.app/api/oauth/ropc -H "Content-Type: application/json" -d '{}'

# Verify token was saved
curl -X GET https://scraper-nzsuxiw5eq-uc.a.run.app/api/oauth/token
```

### Test via UI

1. **Start the UI development server:**
   ```bash
   cd dutch-law-scraper-ui
   pnpm dev
   ```

2. **Login as admin user**

3. **Navigate to Dashboard**

4. **Test One-Click Refresh:**
   - Look at token status (should show current status)
   - Click "Refresh Token" button
   - Watch status update automatically
   - Verify new expiration time (~78 minutes from now)

## Troubleshooting

### Refresh Button Not Working
- **Check:** User is logged in as administrator
- **Check:** Backend API is accessible at https://scraper-nzsuxiw5eq-uc.a.run.app
- **Check:** Network tab for error details

### ROPC Authentication Fails
- **Check:** Credentials in server.js:2036-2037 are correct
- **Check:** Using `/organizations` endpoint (not `/common`)
- **Check:** Client ID matches Azure AD app
- **Check:** User account has Mavim API permissions

### Token Not Saving
- **Check:** ROPC endpoint returns success response
- **Check:** Token storage file permissions
- **Check:** Firebase Functions logs: `npm run logs` in functions directory

## Future Enhancements

Potential improvements:
1. **Automatic scheduled refresh** - Refresh token automatically every 60 minutes
2. **Token history visualization** - Chart showing token refresh patterns
3. **Notification system** - Email/Slack alerts when token expires
4. **Multi-environment support** - Different credentials for dev/staging/prod
5. **Credential rotation** - Ability to update stored credentials without code deploy

## Support

For issues or questions:
- Check logs: `npm run logs` in functions directory
- Check browser console for frontend errors
- Verify API responses using curl commands above
