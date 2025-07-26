import 'server-only'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cache } from 'react'
import { redirect } from 'next/navigation'

// Cache the session verification to avoid duplicate requests
export const verifySession = cache(async () => {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }
  
  return { 
    isAuth: true, 
    userId: session.user.id,
    user: session.user 
  }
})

// Get user data with session verification
export const getUser = cache(async () => {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return null
  }
  
  // Get user from database for additional info
  try {
    const { getUserByEmail } = await import('./db')
    const dbUser = await getUserByEmail(session.user.email)
    
    // Return combined data from session and database
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      emailVerified: dbUser?.emailVerified || false,
      createdAt: dbUser?.createdAt,
      provider: dbUser?.provider
    }
  } catch (error) {
    console.error('Error fetching user from database:', error)
    // Fallback to session data only
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    }
  }
})

// Check if user has specific role/permission
export const checkUserPermission = cache(async (requiredRole) => {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return false
  }
  
  // For now, we'll just check if user is authenticated
  // You can extend this with role-based logic later
  return true
})

// Get session without redirecting (useful for optional auth checks)
export const getOptionalSession = cache(async () => {
  const session = await getServerSession(authOptions)
  return session
})