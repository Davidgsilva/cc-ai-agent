import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // If user is authenticated and trying to access login or splash page, redirect to home
    if (token && (pathname === '/login' || pathname === '/splash')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes that don't require authentication
        const publicRoutes = ['/login', '/splash', '/api/auth', '/api/test', '/api/chat', '/api/search']
        
        // Check if the current path is a public route
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }

        // For all other routes, require authentication - redirect to splash instead of login
        if (!token) {
          const url = req.nextUrl.clone()
          url.pathname = '/splash'
          return Response.redirect(url)
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.mp4$).*)",
  ],
}