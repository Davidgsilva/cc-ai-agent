import { NextResponse } from 'next/server'
import { userDataHandler } from '../../../../lib/userDataHandler.js'
import { requireAuth, createAuthErrorResponse } from '../../../../lib/authMiddleware.js'

// Get user search history
export const GET = requireAuth(async function(request) {
  try {
    const user = request.user
    const { searchParams } = new URL(request.url)
    
    const options = {
      limit: parseInt(searchParams.get('limit')) || 20,
      offset: parseInt(searchParams.get('offset')) || 0,
      query: searchParams.get('query') || null
    }

    const result = await userDataHandler.getUserSearchHistory(
      user._id.toString(),
      options
    )

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Error fetching search history:', error)
    return createAuthErrorResponse(
      'Failed to fetch search history',
      500,
      { error: error.message }
    )
  }
})