/**
 * Firebase Admin SDK Initialization
 * Handles Firebase Authentication and Firestore Database
 */

import admin from 'firebase-admin';
import { config } from './index.js';

let db = null;
let auth = null;

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebase() {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase already initialized');
      db = admin.firestore();
      db.FieldValue = admin.firestore.FieldValue;
      auth = admin.auth();
      return { db, auth };
    }

    // Initialize Firebase Admin with service account
    if (config.firebase.projectId && config.firebase.privateKey && config.firebase.clientEmail) {
      const serviceAccount = {
        type: "service_account",
        project_id: config.firebase.projectId,
        private_key: config.firebase.privateKey,
        client_email: config.firebase.clientEmail,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.firebase.projectId,
      });

      console.log('✅ Firebase initialized with service account');
    } else {
      // Fallback: Try to initialize with default credentials (for local development)
      console.log('⚠️  Using default Firebase credentials (development mode)');
      admin.initializeApp({
        projectId: config.firebase.projectId || 'demo-project',
      });
    }

    // Initialize Firestore and Auth
    db = admin.firestore();
    auth = admin.auth();

    // Attach FieldValue to db for convenience (used throughout the codebase as db.FieldValue)
    db.FieldValue = admin.firestore.FieldValue;

    // Configure Firestore settings
    db.settings({
      ignoreUndefinedProperties: true,
    });

    console.log('🔥 Firebase services initialized:');
    console.log('   ✅ Firestore Database');
    console.log('   ✅ Authentication');
    console.log(`   📊 Project ID: ${config.firebase.projectId || 'demo-project'}`);

    return { db, auth };
    
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    
    // For development: create mock services
    if (config.isDevelopment) {
      console.log('🔧 Creating mock Firebase services for development');
      return createMockServices();
    }
    
    throw error;
  }
}

/**
 * Create mock Firebase services for development when credentials are missing
 */
function createMockServices() {
  const mockDb = {
    collection: (name) => ({
      add: async (data) => ({ id: 'mock-id-' + Date.now() }),
      doc: (id) => ({
        get: async () => ({ 
          exists: false, 
          data: () => null 
        }),
        set: async (data) => console.log(`Mock DB: Set ${name}/${id}`, data),
        update: async (data) => console.log(`Mock DB: Update ${name}/${id}`, data),
        delete: async () => console.log(`Mock DB: Delete ${name}/${id}`)
      }),
      where: () => ({
        get: async () => ({ docs: [], size: 0 }),
        orderBy: () => ({
          limit: () => ({
            get: async () => ({ docs: [], size: 0 })
          })
        })
      }),
      get: async () => ({ docs: [], size: 0 })
    }),
    FieldValue: {
      increment: (n) => n,
      delete: () => null,
      serverTimestamp: () => new Date()
    }
  };

  const mockAuth = {
    verifyIdToken: async (token) => ({
      uid: 'mock-user-id',
      email: 'mock@example.com'
    }),
    createUser: async (data) => ({ uid: 'mock-user-' + Date.now() }),
    updateUser: async (uid, data) => console.log(`Mock Auth: Update user ${uid}`, data)
  };

  console.log('🔧 Mock Firebase services created for development');
  return { db: mockDb, auth: mockAuth };
}

/**
 * Get initialized Firebase services
 */
export function getFirebaseServices() {
  if (!db || !auth) {
    return initializeFirebase();
  }
  return { db, auth };
}

// Initialize Firebase on import
const services = initializeFirebase();
export const { db: firestore, auth: firebaseAuth } = services;

// Export for backward compatibility
export { firestore as db, firebaseAuth as auth };
export default admin;