import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByEmail, createUser } from './db'
import { sendWelcomeEmail } from './email'
import { generateRandomToken } from './utils'
import bcrypt from 'bcryptjs'

export const authOptions = {
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
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account.provider === "google") {
        try {
          // Check if user already exists
          const existingUser = await getUserByEmail(user.email)
          
          if (!existingUser) {
            // Create new user
            const newUser = await createUser({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: 'google',
              providerId: user.id,
              emailVerified: true // Google emails are pre-verified
            })
            
            // Send welcome email
            await sendWelcomeEmail(user.email, user.name)
          }
          
          return true
        } catch (error) {
          console.error('Error during sign in:', error)
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
  },
}