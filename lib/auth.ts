import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getAdminDb } from './firebase-admin'
import { z } from 'zod'

// Validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const validatedCredentials = credentialsSchema.parse(credentials)
          const { email, password } = validatedCredentials

          // Get user from Firestore
          const db = getAdminDb()
          const usersRef = db.collection('users')
          const snapshot = await usersRef.where('email', '==', email).limit(1).get()

          if (snapshot.empty) {
            return null
          }

          const userDoc = snapshot.docs[0]
          const userData = userDoc.data()

          // Verify password
          const isValid = await bcrypt.compare(password, userData.password)
          if (!isValid) {
            return null
          }

          // Return user object
          return {
            id: userDoc.id,
            email: userData.email,
            name: userData.name,
            image: userData.image || null,
            role: userData.role || 'customer',
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }

      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to get session in server components
export const getSession = () => getServerSession(authOptions)
