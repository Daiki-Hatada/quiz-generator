import * as admin from 'firebase-admin'
import { getApp } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { env } from '../env'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.PROJECT_ID,
      clientEmail: env.CLIENT_EMAIL,
      privateKey: env.PRIVATE_KEY,
    }),
    storageBucket: env.STORAGE_BUCKET,
  })
}

const app = getApp()
export const storage = getStorage(app)
export default admin
