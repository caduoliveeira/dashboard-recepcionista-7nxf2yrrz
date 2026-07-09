import { useState, useEffect } from 'react'

export type UserRole = 'owner' | 'receptionist'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarSeed: string
  gender: 'male' | 'female'
}

const mockUsers: Record<string, { password: string; user: User }> = {
  'owner@gym.com': {
    password: 'owner123',
    user: {
      id: 'u-0',
      name: 'Carlos Mendes',
      email: 'owner@gym.com',
      role: 'owner',
      avatarSeed: 'c1',
      gender: 'male',
    },
  },
  'ana@gym.com': {
    password: 'ana123',
    user: {
      id: 'u-1',
      name: 'Ana Silva',
      email: 'ana@gym.com',
      role: 'receptionist',
      avatarSeed: 'a1',
      gender: 'female',
    },
  },
  'bruno@gym.com': {
    password: 'bruno123',
    user: {
      id: 'u-2',
      name: 'Bruno Costa',
      email: 'bruno@gym.com',
      role: 'receptionist',
      avatarSeed: 'b1',
      gender: 'male',
    },
  },
}

let globalUser: User | null = null
let listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

export function getStoredUser(): User | null {
  return globalUser
}

export function getAvatarUrl(
  person: { avatarSeed: string; gender: string },
  size: 'thumbnail' | 'medium' | 'large' = 'thumbnail',
) {
  return `https://img.usecurling.com/ppl/${size}?gender=${person.gender}&seed=${person.avatarSeed}`
}

export const demoAccounts = [
  { label: 'Proprietário', email: 'owner@gym.com', password: 'owner123' },
  { label: 'Recepcionista', email: 'ana@gym.com', password: 'ana123' },
]

export default function useAuthStore() {
  const [user, setUser] = useState<User | null>(globalUser)

  useEffect(() => {
    const listener = () => setUser(globalUser)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const login = (email: string, password: string): boolean => {
    const entry = mockUsers[email.toLowerCase()]
    if (entry && entry.password === password) {
      globalUser = entry.user
      notify()
      return true
    }
    return false
  }

  const logout = () => {
    globalUser = null
    notify()
  }

  return { user, login, logout }
}
