import { NextResponse } from 'next/server'
import { verifyEmail, getUserByEmail } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
  }

  try {
    const success = await verifyEmail(token)
    
    if (success) {
      // Optionally send welcome email after verification
      // You might want to track this to avoid duplicate emails
      
      return NextResponse.redirect(new URL('/login?verified=true', request.url))
    } else {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
    }
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/login?error=verification_failed', request.url))
  }
}