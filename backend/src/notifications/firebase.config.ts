import * as admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (path) {
  try {
    const resolved = resolve(process.cwd(), path);
    if (!existsSync(resolved)) {
      console.warn('Firebase: service account file not found at', resolved);
    } else {
      const serviceAccount = JSON.parse(readFileSync(resolved, 'utf8'));
      if (typeof serviceAccount?.project_id !== 'string') {
        console.warn(
          'Firebase: service account must contain string "project_id". Skipping init.',
        );
      } else {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
    }
  } catch (err) {
    console.error('Firebase initialization failed:', err);
  }
}

export const getMessaging = (): admin.messaging.Messaging | null =>
  admin.apps.length > 0 ? admin.messaging() : null;
