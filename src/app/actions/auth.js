'use server'

import { redirect } from 'next/navigation'

export async function logout() {
  // For server actions, we redirect to NextAuth's sign out endpoint
  // This will properly clear the session and redirect
  redirect('/api/auth/signout')
}