'use client'

import {
  GithubAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { firebaseAuth } from './firebase/client'

async function createSessionCookie(user: { getIdToken: () => Promise<string> }) {
  const idToken = await user.getIdToken()
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  if (!res.ok) throw new Error('Failed to create session')
}

export async function signUpWithEmail(email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password)
  await sendEmailVerification(user)
  await createSessionCookie(user)
  return user
}

export async function signInWithEmail(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password)
  await createSessionCookie(user)
  return user
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const { user } = await signInWithPopup(firebaseAuth, provider)
  await createSessionCookie(user)
  return user
}

export async function signInWithGitHub() {
  const provider = new GithubAuthProvider()
  const { user } = await signInWithPopup(firebaseAuth, provider)
  await createSessionCookie(user)
  return user
}

export async function signOut() {
  await firebaseSignOut(firebaseAuth)
  await fetch('/api/auth/session', { method: 'DELETE' })
  window.location.href = '/login'
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(firebaseAuth, email)
}
