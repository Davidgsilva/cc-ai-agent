import { NextResponse } from 'next/server'
import { userDataHandler } from '../../../../lib/userDataHandler.js'
import { requireAuth, createAuthErrorResponse } from '../../../../lib/authMiddleware.js'

// Get user preferences
export const GET = requireAuth(async function(request) {
  try {
    const user = request.user
    
    const preferences = await userDataHandler.getUserPreferences(
      user._id.toString()
    )

    return NextResponse.json({
      success: true,
      preferences
    })

  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return createAuthErrorResponse(
      'Failed to fetch user preferences',
      500,
      { error: error.message }
    )
  }
})

// Update user preferences
export const PUT = requireAuth(async function(request) {
  try {
    const user = request.user
    const body = await request.json()
    
    if (!body.preferences || typeof body.preferences !== 'object') {
      return createAuthErrorResponse('Invalid preferences data', 400)
    }

    const result = await userDataHandler.updateUserPreferences(
      user._id.toString(),
      body.preferences
    )

    return NextResponse.json({
      success: true,
      updated: result.modifiedCount > 0 || result.upsertedCount > 0
    })

  } catch (error) {
    console.error('Error updating user preferences:', error)
    return createAuthErrorResponse(
      'Failed to update user preferences',
      500,
      { error: error.message }
    )
  }
})