# API URL Configuration Changes

## Summary
All hardcoded API URLs have been replaced with environment variable `VITE_API_BASE_URL`.

## Changes Made

### 1. Created `.env` file in client directory
- **File**: `client/.env`
- **Content**: 
  - Local Development URL: `http://localhost:8000` (active)
  - Production URL: `https://server-production-9019.up.railway.app` (commented)
  
To switch between environments, simply comment/uncomment the desired URL in the `.env` file.

### 2. Updated Files (11 API calls replaced)

#### `client/src/contexts/EventsContext.tsx`
- Updated `API_BASE_URL` constant to use environment variable

#### `client/src/contexts/AuthContext.tsx` (5 API calls)
- `/api/auth/me` (initial session check)
- `/api/auth/refresh` (token refresh)
- `/api/auth/me` (retry after refresh)
- `/api/auth/login` (user login)
- `/api/permissions/request-access` (request posting access)

#### `client/src/pages/Register/index.tsx` (1 API call)
- `/api/auth/register` (user registration)

#### `client/src/pages/Events/index.tsx` (1 API call)
- `/api/auth/logout` (user logout)

#### `client/src/pages/Events/AccessRequestsDialog.tsx` (3 API calls)
- `/api/permissions/requests` (fetch access requests)
- `/api/permissions/approve/:id` (approve request)
- `/api/permissions/deny/:id` (deny request)

## How to Use

### Switch to Local Development
```env
# Local Development
VITE_API_BASE_URL=http://localhost:8000

# Production
# VITE_API_BASE_URL=https://server-production-9019.up.railway.app
```

### Switch to Production
```env
# Local Development
# VITE_API_BASE_URL=http://localhost:8000

# Production
VITE_API_BASE_URL=https://server-production-9019.up.railway.app
```

After changing the `.env` file, restart your development server for changes to take effect.

## Verification
✅ All 11 instances of hardcoded URLs have been replaced
✅ No remaining hardcoded production URLs in client source code
✅ Environment variable is properly configured
