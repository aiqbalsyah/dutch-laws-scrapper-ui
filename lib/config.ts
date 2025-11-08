// Centralized configuration with default values to prevent build errors
// All environment variables should be accessed through this config

// Vercel sets VERCEL_ENV instead of NODE_ENV
const isVercel = process.env.VERCEL === '1'
const nodeEnv = process.env.NODE_ENV || process.env.VERCEL_ENV || 'development'
const isProduction = nodeEnv === 'production' || isVercel

export const config = {
  // App Configuration
  nodeEnv: nodeEnv,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
  
  // Authentication
  auth: {
    secret: process.env.NEXTAUTH_SECRET || '',
    url: process.env.NEXTAUTH_URL || '',
  },
  
  // Firebase Client SDK (Public)
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  },
  
  // Firebase Admin SDK (Server-side)
  firebaseAdmin: {
    projectId: process.env.AUTH_FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY || '',
  },
  
  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  
  // Email Service
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
  },
  
  // Google OAuth (Optional)
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  
  // Runtime Environment Detection
  runtime: {
    isProduction: isProduction,
    isDevelopment: nodeEnv === 'development',
    isTest: nodeEnv === 'test',
    isBuildTime: process.env.NEXT_PHASE === 'phase-production-build',
    isCloudRun: !!(process.env.K_SERVICE || process.env.FIREBASE_CONFIG),
    isVercel: isVercel,
  },
  
  // Feature Flags
  features: {
    debugMode: process.env.AUTH_DEBUG_TOKEN ? true : false,
  }
}

// Type-safe config
export type Config = typeof config

// Validation function to check required variables at runtime
export function validateConfig() {
  const errors: string[] = []
  
  // Only validate in runtime, not during build
  if (config.runtime.isBuildTime) {
    return { isValid: true, errors: [] }
  }
  
  // Check required variables for runtime
  if (!config.auth.secret && config.runtime.isProduction) {
    errors.push('NEXTAUTH_SECRET is required in production')
  }
  
  if (!config.firebase.projectId) {
    errors.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID is required')
  }
  
  if (!config.firebaseAdmin.projectId && !config.runtime.isCloudRun) {
    errors.push('AUTH_FIREBASE_PROJECT_ID is required when not on Cloud Run')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}