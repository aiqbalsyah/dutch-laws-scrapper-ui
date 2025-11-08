import { initializeApp, getApps, cert, applicationDefault, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { config } from '@/config'

let app: App | undefined
let auth: Auth | undefined
let db: Firestore | undefined

function initializeFirebaseAdmin() {
  if (app) return { app, auth: auth!, db: db! }
  
  // Skip initialization during build
  if (config.runtime.isBuildTime) {
    return { app: null, auth: null, db: null }
  }
  
  try {
    // Check if we're running on Cloud Run (has ADC available)
    const firebaseAdminConfig = config.runtime.isCloudRun
      ? {
          // Use Application Default Credentials in Cloud Run
          credential: applicationDefault(),
        }
      : {
          // Use service account credentials
          credential: cert({
            projectId: config.firebaseAdmin.projectId,
            clientEmail: config.firebaseAdmin.clientEmail,
            privateKey: config.firebaseAdmin.privateKey.replace(/\\n/g, '\n'),
          }),
        }
    
    if (!config.firebaseAdmin.projectId && !config.runtime.isCloudRun) {
      throw new Error('Firebase Admin SDK credentials not configured')
    }
    
    if (getApps().length === 0) {
      app = initializeApp(firebaseAdminConfig)
    } else {
      app = getApps()[0]
    }
    
    auth = getAuth(app)
    db = getFirestore(app)
    
    return { app, auth, db }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error)
    throw error
  }
}

// Lazy initialization - only initialize when actually used
export const getAdminAuth = (): Auth => {
  const { auth } = initializeFirebaseAdmin()
  if (!auth) throw new Error('Firebase Admin Auth not initialized')
  return auth
}

export const getAdminDb = (): Firestore => {
  const { db } = initializeFirebaseAdmin()
  if (!db) throw new Error('Firebase Admin Firestore not initialized')
  return db
}

// Export for backward compatibility, but these will throw if used during build
export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    return getAdminAuth()[prop as keyof Auth]
  }
})

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    return getAdminDb()[prop as keyof Firestore]
  }
})