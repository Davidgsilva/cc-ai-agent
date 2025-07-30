import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByEmail, createUser } from './db'
import { sendWelcomeEmail, sendConfirmationEmail } from './email'
import { generateRandomToken } from './utils'
import bcrypt from 'bcryptjs'

export const authOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await getUserByEmail(credentials.email)
          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: user.emailVerified
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 // 15 minutes
      }
    },
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 // 15 minutes
      }
    },
    nonce: {
      name: `next-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('[AUTH] signIn callback triggered', { provider: account?.provider, userEmail: user?.email })
      
      if (account.provider === "google") {
        try {
          console.log('[AUTH] Processing Google sign-in for:', user.email)
          
          // Check if user already exists
          const existingUser = await getUserByEmail(user.email)
          console.log('[AUTH] Existing user found:', !!existingUser)
          
          if (!existingUser) {
            console.log('[AUTH] Creating new user...')
            // Create new user
            const newUser = await createUser({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: 'google',
              providerId: user.id,
              emailVerified: true // Google emails are pre-verified
            })
            console.log('[AUTH] New user created:', newUser._id)
            
            // Send confirmation email (non-blocking)
            try {
              await sendConfirmationEmail(user.email, user.name)
              console.log('[AUTH] Confirmation email sent successfully')
            } catch (emailError) {
              console.warn('[AUTH] Confirmation email failed (non-critical):', emailError.message)
            }
          } else {
            console.log('[AUTH] User already exists, proceeding with login')
          }
          
          return true
        } catch (error) {
          console.error('[AUTH] Error during sign in:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, account, profile, user }) {
      // Add user ID to token for server-side use
      if (account && user) {
        token.userId = user.id || user.email // Use email as fallback ID
        token.accessToken = account.access_token
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      // Add user ID to session
      session.user.id = token.userId
      session.user.email = token.email
      session.user.name = token.name
      session.user.image = token.picture
      session.accessToken = token.accessToken
      return session
    },
  },
  pages: {
    signIn: '/splash',
    error: '/splash',
  },
  trustHost: true,
}