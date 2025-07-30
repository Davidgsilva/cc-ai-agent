import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth.js"
import { getUserByEmail } from "./db.js"
import { NextResponse } from "next/server"

// Get authenticated user from request
export async function getAuthenticatedUser(request) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return null
    }

    // Get full user data from database
    const user = await getUserByEmail(session.user.email)
    
    if (!user) {
      console.warn('[AUTH] Session exists but user not found in database:', session.user.email)
      return null
    }

    // Return user with session info
    return {
      ...user,
      sessionUser: session.user
    }
  } catch (error) {
    console.error('[AUTH] Error getting authenticated user:', error)
    return null
  }
}

// Middleware to require authentication
export function requireAuth(handler) {
  return async function(request, context) {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Add user to request context
    request.user = user
    return handler(request, context)
  }
}

// Optional auth - get user if available but don't require it
export function optionalAuth(handler) {
  return async function(request, context) {
    const user = await getAuthenticatedUser(request)
    
    // Add user to request context (can be null)
    request.user = user
    return handler(request, context)
  }
}

// Get client metadata for logging/tracking
export function getClientMetadata(request) {
  return {
    clientIP: request.ip || 
              request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
              request.headers.get('x-real-ip') || 
              'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date().toISOString()
  }
}

// Enhanced error response with user context
export function createAuthErrorResponse(message, status = 401, details = {}) {
  console.error(`🚫 Auth Error (${status}):`, { message, details })
  
  return NextResponse.json(
    { 
      error: message,
      status,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { details })
    },
    { status }
  )
}