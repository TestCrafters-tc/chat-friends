import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Double check checking environment variables or injecting global parameters
// Define window interface for TypeScript
declare global {
  interface Window {
    __app_id?: string;
    __initial_auth_token?: string;
  }
}

export const APP_ID = typeof window !== 'undefined' && window.__app_id 
  ? window.__app_id 
  : '4dd8b1d9-0e36-4b18-86a1-e09496787e00';

// Real Firebase Configuration matching user's original secure channel
const firebaseConfig = {
  apiKey: "AIzaSyChtFMVu3t_FUhzwrjcgLJ6ettDOTgiPuo",
  authDomain: "chat-friends-24d14.firebaseapp.com",
  projectId: "chat-friends-24d14",
  storageBucket: "chat-friends-24d14.firebasestorage.app",
  messagingSenderId: "759058935291",
  appId: "1:759058935291:web:4280edd1a10c7566aaef5e",
  measurementId: "G-EWSEYYR4CE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Compliant with Firebase Integration Skill custom error telemetry format
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
