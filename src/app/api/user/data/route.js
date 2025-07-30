import { NextResponse } from 'next/server'
import { userDataHandler } from '../../../../lib/userDataHandler.js'
import { requireAuth, createAuthErrorResponse } from '../../../../lib/authMiddleware.js'

// Export all user data (GDPR compliance)
export const GET = requireAuth(async function(request) {
  try {
    const user = request.user
    
    const userData = await userDataHandler.exportUserData(
      user._id.toString()
    )

    return NextResponse.json({
      success: true,
      ...userData
    }, {
      headers: {
        'Content-Disposition': `attachment; filename="user-data-${user._id}.json"`,
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Error exporting user data:', error)
    return createAuthErrorResponse(
      'Failed to export user data',
      500,
      { error: error.message }
    )
  }
})

// Delete all user data (GDPR compliance)
export const DELETE = requireAuth(async function(request) {
  try {
    const user = request.user
    
    // Confirm deletion with query param
    const { searchParams } = new URL(request.url)
    const confirm = searchParams.get('confirm')
    
    if (confirm !== 'true') {
      return createAuthErrorResponse(
        'Data deletion requires confirmation. Add ?confirm=true to the request.',
        400
      )
    }

    const result = await userDataHandler.deleteAllUserData(
      user._id.toString()
    )

    return NextResponse.json({
      success: true,
      message: 'All user data has been permanently deleted',
      ...result
    })

  } catch (error) {
    console.error('Error deleting user data:', error)
    return createAuthErrorResponse(
      'Failed to delete user data',
      500,
      { error: error.message }
    )
  }
})