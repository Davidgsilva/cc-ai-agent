import { createUser, getUserByEmail, initializeDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('[TEST-DB] Starting database test...')
    
    // Initialize database
    await initializeDatabase()
    console.log('[TEST-DB] Database initialized')
    
    // Test user data
    const testUser = {
      email: 'test-' + Date.now() + '@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.png',
      provider: 'google',
      providerId: 'test-' + Date.now(),
      emailVerified: true
    }
    
    console.log('[TEST-DB] Creating test user:', testUser.email)
    
    // Create user
    const newUser = await createUser(testUser)
    console.log('[TEST-DB] User created:', newUser._id)
    
    // Verify user exists
    const verifyUser = await getUserByEmail(testUser.email)
    console.log('[TEST-DB] User verified:', !!verifyUser)
    
    return NextResponse.json({
      success: true,
      message: 'Database test successful',
      userId: newUser._id,
      verified: !!verifyUser
    })
    
  } catch (error) {
    console.error('[TEST-DB] Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}