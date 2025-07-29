# Next.js Authentication Flow & Google OAuth Documentation

## Overview
Your app uses NextAuth.js with dual authentication support: Google OAuth and email/password credentials. The MainLayout component is conditionally displayed based on authentication status through middleware and server-side checks.

## Authentication Configuration

### Providers (`src/lib/auth.js:9-49`)
- **Google OAuth**: Configured with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- **Credentials**: Email/password with bcrypt hashing

### Session Management (`src/lib/auth.js:51-54`)
- JWT strategy with 7-day expiration
- Custom sign-in page at `/splash`

## Authentication Flow

### 1. Route Protection (`src/middleware.js`)
**Public Routes**: `/login`, `/splash`, `/api/auth`, `/api/test`, `/api/chat`, `/api/search`

**Logic**:
- Authenticated users redirected from `/login` or `/splash` to home (`src/middleware.js:10-12`)
- Unauthenticated users redirected to `/splash` for protected routes (`src/middleware.js:30-34`)

### 2. Google OAuth Flow (`src/lib/auth.js:56-84`)
1. User signs in with Google
2. `signIn` callback checks for existing user by email (`src/lib/auth.js:60`)
3. If new user: creates account with `emailVerified: true` and sends welcome email (`src/lib/auth.js:64-74`)
4. JWT token includes user data and Google access token (`src/lib/auth.js:85-95`)

### 3. MainLayout Display Logic

**Server-Side Check** (`src/app/page.js:4-8`):
```javascript
const user = await getUser();
return <MainLayout />;
```

**Session Verification** (`src/lib/dal.js:8-20`):
- `verifySession()`: Redirects to `/login` if no session
- `getUser()`: Returns user data or `null`, combines session + database info (`src/lib/dal.js:23-55`)

## Key Components

### Data Access Layer (`src/lib/dal.js`)
- `getUser()`: Fetches user from session + database
- `verifySession()`: Enforces authentication with redirect
- `getOptionalSession()`: Non-redirecting session check

### Database Integration
- Users stored via `createUser()` and retrieved via `getUserByEmail()` (`src/lib/db.js`)
- Email verification and welcome emails handled automatically for Google OAuth

## MainLayout Conditional Display

The MainLayout is displayed when:
1. User passes middleware authentication check
2. `getUser()` in `page.js` doesn't trigger redirect
3. Session exists and is valid

**Flow**: Middleware → Server Session Check → MainLayout Render