import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { getFirebaseConfig } from 'src/common/utils';

@Injectable()
export class FirebaseAdminService {
  private firebaseApp: admin.app.App;

  constructor() {
    const firebaseConfig = getFirebaseConfig();

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });
  }

  getFirebaseApp(): admin.app.App {
    return this.firebaseApp;
  }
}
