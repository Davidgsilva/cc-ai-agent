import { NextResponse } from 'next/server'
import { userDataHandler } from '../../../../lib/userDataHandler.js'
import { requireAuth, createAuthErrorResponse } from '../../../../lib/authMiddleware.js'

// Get user activity statistics
export const GET = requireAuth(async function(request) {
  try {
    const user = request.user
    const { searchParams } = new URL(request.url)
    
    const timeframe = searchParams.get('timeframe') || '7d'
    
    // Validate timeframe format (e.g., "7d", "30d", "90d")
    if (!/^\d+d$/.test(timeframe)) {
      return createAuthErrorResponse('Invalid timeframe format. Use format like "7d", "30d"', 400)
    }

    const stats = await userDataHandler.getUserStats(
      user._id.toString(),
      timeframe
    )

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return createAuthErrorResponse(
      'Failed to fetch user statistics',
      500,
      { error: error.message }
    )
  }
})