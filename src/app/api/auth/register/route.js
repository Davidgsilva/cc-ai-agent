import { NextResponse } from 'next/server'
import { getUserByEmail, createUser } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import { generateRandomToken } from '@/lib/utils'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = generateRandomToken()

    // Create user
    const newUser = await createUser({
      email,
      password: hashedPassword,
      name,
      provider: 'credentials',
      verificationToken,
      emailVerified: false
    })

    // Send verification email
    const emailResult = await sendVerificationEmail(email, name, verificationToken)

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      // Continue anyway - user is created but email failed
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      userId: newUser._id,
      emailSent: emailResult.success
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    )
  }
}