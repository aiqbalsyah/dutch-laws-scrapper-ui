# Mavim OAuth Token Setup Guide

## Overview

The Dutch Law Scraper requires a Mavim OAuth token to interact with the Mavim API. This token is managed on the scraper backend server, not in this UI application.

## Common Error: "No refresh token available"

If you see this error when trying to refresh the token, it means the scraper backend doesn't have a refresh token configured yet.

### Error Message:
```json
{
  "success": false,
  "error": "No refresh token available",
  "message": "Please save a refresh token first..."
}
```

## Resolution Steps

### 1. Initial Token Setup (Backend Administrator)

The initial OAuth token must be configured on the scraper backend server. This is a one-time setup.

**Backend API Endpoint:** `POST https://scraper-nzsuxiw5eq-uc.a.run.app/api/oauth/token`

The backend administrator needs to:

1. Obtain OAuth credentials from Mavim:
   - Client ID
   - Client Secret
   - Initial refresh token (from OAuth flow)

2. Configure these credentials on the backend server
   - These are typically stored in environment variables or secure storage
   - The backend uses these to manage token refresh automatically

3. Once configured, the backend will:
   - Store the refresh token securely
   - Automatically refresh access tokens when they expire
   - Provide token status via the `/api/oauth/token` GET endpoint

### 2. Using the UI After Setup

Once the backend is configured, you can:

1. **View Token Status**: The dashboard shows current token status
   - Valid: Token is active
   - Expiring Soon: Token will expire within 5 minutes
   - Expired: Token needs refresh

2. **Manual Refresh** (Admins only):
   - Click "Refresh Token" button in the Token Status card
   - This triggers the backend to refresh the token using the stored refresh token

3. **Automatic Refresh**:
   - The backend automatically refreshes tokens when they expire
   - Jobs will continue running without interruption

## Token Lifecycle

```
Initial Setup (Backend)
  ↓
Backend stores refresh token
  ↓
Backend generates access tokens
  ↓
UI displays token status ← [You are here if seeing errors]
  ↓
Jobs use access token
  ↓
Token expires → Backend auto-refreshes
  ↓
[Cycle continues]
```

## Troubleshooting

### "No refresh token available"
- **Cause**: Backend not configured with initial refresh token
- **Solution**: Contact backend administrator to complete initial setup

### "Token has expired"
- **Cause**: Token expired and auto-refresh failed
- **Solution**:
  1. Try manual refresh (admin only)
  2. If manual refresh fails, check backend logs
  3. May need to re-initialize OAuth flow

### "Failed to refresh token"
- **Cause**: Network error or backend issue
- **Solution**:
  1. Check network connectivity
  2. Verify backend server is running
  3. Check backend logs for errors

## For Backend Administrators

### Backend Configuration Required:

The scraper backend needs these environment variables:

```bash
# Mavim OAuth Configuration
MAVIM_CLIENT_ID=15e1f0d0-3141-47b0-a87e-323d62b71b75
MAVIM_CLIENT_SECRET=<your-client-secret>
MAVIM_REFRESH_TOKEN=<initial-refresh-token>
MAVIM_SCOPE=https://adapps.mavimcloud.com/mavim/Mavim.iMprove.ReadWrite.All openid profile offline_access
```

### Backend Endpoints:

- `GET /api/oauth/token` - Get current token status
- `POST /api/oauth/token` - Refresh access token using stored refresh token

## Security Notes

- Refresh tokens are **never** exposed to the UI
- Only access token status and expiry are shown
- All sensitive token operations happen on the backend
- UI only triggers refresh requests (admin-authenticated)

## Contact

If you continue experiencing token issues:
1. Check backend server logs
2. Verify OAuth credentials are correct
3. Ensure Mavim API is accessible from backend
4. Contact the system administrator for backend configuration support
