import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (path) {
  try {
    const resolved = resolve(process.cwd(), path);
    const serviceAccount = JSON.parse(readFileSync(resolved, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (err) {
    console.error('Firebase initialization failed:', err);
  }
}

export const getMessaging = (): admin.messaging.Messaging => admin.messaging();
