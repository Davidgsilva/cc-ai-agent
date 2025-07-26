import { NextResponse } from 'next/server'
import { getUserByEmail, setVerificationToken } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import { generateRandomToken } from '@/lib/utils'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 })
    }

    // Generate new verification token
    const verificationToken = generateRandomToken()
    await setVerificationToken(email, verificationToken)

    // Send verification email
    const emailResult = await sendVerificationEmail(email, user.name, verificationToken)

    if (emailResult.success) {
      return NextResponse.json({ 
        message: 'Verification email sent successfully',
        success: true 
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to send verification email',
        details: emailResult.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}