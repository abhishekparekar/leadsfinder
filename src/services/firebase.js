

import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBX19VWQ81SAB5Hy_gkMyV6Dwx9SZgy6iI",
  authDomain: "job-portal-85414.firebaseapp.com",
  databaseURL: "https://job-portal-85414-default-rtdb.firebaseio.com",
  projectId: "job-portal-85414",
  storageBucket: "job-portal-85414.firebasestorage.app",
  messagingSenderId: "699831995778",
  appId: "1:699831995778:web:7d01d3341532973dd4d39b",
  measurementId: "G-GNGCHGZ6RK"
};

export const TENANT_ID = 'icoded-leads-abhi';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Analytics safely
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app);
  }).catch(() => {});
}

// Tenant Collection Helpers
export function getTenantCollection(subcollectionName) {
  return collection(db, 'tenants', TENANT_ID, subcollectionName);
}

export function getTenantDoc(subcollectionName, docId) {
  return doc(db, 'tenants', TENANT_ID, subcollectionName, docId);
}
