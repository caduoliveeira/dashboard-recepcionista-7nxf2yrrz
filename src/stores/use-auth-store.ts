export type UserRole = 'owner' | 'receptionist'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarSeed: string
  gender: 'male' | 'female'
}

export const demoAccounts: { label: string; email: string; password: string }[] = []

export function getStoredUser(): User | null {
  return null
}

export function getAvatarUrl(
  _person: { avatarSeed: string; gender: string },
  _size: 'thumbnail' | 'medium' | 'large' = 'thumbnail',
) {
  return ''
}

export default function useAuthStore() {
  return {
    user: null as User | null,
    login: () => false,
    logout: () => {},
  }
}
