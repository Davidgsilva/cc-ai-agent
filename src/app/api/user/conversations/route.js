import { NextResponse } from 'next/server'
import { userDataHandler } from '../../../../lib/userDataHandler.js'
import { requireAuth, createAuthErrorResponse } from '../../../../lib/authMiddleware.js'

// Get user conversations with pagination
export const GET = requireAuth(async function(request) {
  try {
    const user = request.user
    const { searchParams } = new URL(request.url)
    
    const options = {
      limit: parseInt(searchParams.get('limit')) || 20,
      offset: parseInt(searchParams.get('offset')) || 0,
      sortBy: searchParams.get('sortBy') || 'updatedAt',
      sortOrder: parseInt(searchParams.get('sortOrder')) || -1,
      status: searchParams.get('status') || 'active'
    }

    const result = await userDataHandler.getUserConversations(
      user._id.toString(),
      options
    )

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Error fetching user conversations:', error)
    return createAuthErrorResponse(
      'Failed to fetch conversations',
      500,
      { error: error.message }
    )
  }
})

// Create new conversation
export const POST = requireAuth(async function(request) {
  try {
    const user = request.user
    const body = await request.json()
    
    const conversation = await userDataHandler.createConversation(
      user._id.toString(),
      {
        title: body.title || 'New Conversation',
        provider: body.provider || 'openai',
        userAgent: request.headers.get('user-agent'),
        clientIP: request.headers.get('x-forwarded-for') || 'unknown'
      }
    )

    return NextResponse.json({
      success: true,
      conversation
    })

  } catch (error) {
    console.error('Error creating conversation:', error)
    return createAuthErrorResponse(
      'Failed to create conversation',
      500,
      { error: error.message }
    )
  }
})