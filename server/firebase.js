/**
 * Firebase Firestore Configuration & Multi-Tenant Service
 * Configured for project: job-portal-85414
 * Tenant Namespace: icoded-leads-abhi
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
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
export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);

// Tenant Path Helper: tenants/icoded-leads-abhi/{subcollection}
export function getTenantCollection(subcollectionName) {
  return collection(firestore, 'tenants', TENANT_ID, subcollectionName);
}

export function getTenantDoc(subcollectionName, docId) {
  return doc(firestore, 'tenants', TENANT_ID, subcollectionName, docId);
}
