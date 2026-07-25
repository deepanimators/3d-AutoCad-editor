'use client'

import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { firebaseAuth } from './firebase/client'

export type { User as FirebaseUser }

export function useFirebaseUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, setUser)
  }, [])

  return { user, loading: user === undefined }
}
