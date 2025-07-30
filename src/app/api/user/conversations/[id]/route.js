import { NextResponse } from 'next/server'
import { userDataHandler } from '../../../../../lib/userDataHandler.js'
import { requireAuth, createAuthErrorResponse } from '../../../../../lib/authMiddleware.js'

// Get specific conversation with messages
export const GET = requireAuth(async function(request, { params }) {
  try {
    const user = request.user
    const conversationId = params.id
    const { searchParams } = new URL(request.url)
    
    const options = {
      limit: parseInt(searchParams.get('limit')) || 50,
      offset: parseInt(searchParams.get('offset')) || 0,
      sortOrder: parseInt(searchParams.get('sortOrder')) || 1
    }

    const result = await userDataHandler.getConversationMessages(
      user._id.toString(),
      conversationId,
      options
    )

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Error fetching conversation:', error)
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return createAuthErrorResponse(error.message, 404)
    }
    
    return createAuthErrorResponse(
      'Failed to fetch conversation',
      500,
      { error: error.message }
    )
  }
})

// Delete conversation
export const DELETE = requireAuth(async function(request, { params }) {
  try {
    const user = request.user
    const conversationId = params.id

    const result = await userDataHandler.deleteConversation(
      user._id.toString(),
      conversationId
    )

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Error deleting conversation:', error)
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return createAuthErrorResponse(error.message, 404)
    }
    
    return createAuthErrorResponse(
      'Failed to delete conversation',
      500,
      { error: error.message }
    )
  }
})