import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export type UserRole = 'owner' | 'receptionist' | null

interface AuthContextType {
  user: User | null
  session: Session | null
  role: UserRole
  profile: any
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const profileFetchedRef = useRef<string | null>(null)
  const sessionCheckedRef = useRef(false)

  const fetchProfile = useCallback(async (userId: string) => {
    if (profileFetchedRef.current === userId) return
    profileFetchedRef.current = userId

    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

      if (error) {
        console.error('Error fetching profile:', error)
        profileFetchedRef.current = null
        setLoading(false)
        return
      }

      if (data && data.is_active === false) {
        profileFetchedRef.current = null
        await supabase.auth.signOut()
        setProfile(null)
        setRole(null)
        setUser(null)
        setSession(null)
        setLoading(false)
        return
      }

      setProfile(data)
      setRole(data?.role as UserRole)
      setLoading(false)
    } catch (err) {
      console.error('Unexpected error fetching profile:', err)
      profileFetchedRef.current = null
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    let subscription: any

    try {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          profileFetchedRef.current = null
          setProfile(null)
          setRole(null)
          if (sessionCheckedRef.current) {
            setLoading(false)
          }
        }
      })
      subscription = data?.subscription

      supabase.auth
        .getSession()
        .then(({ data: { session }, error }) => {
          if (!mounted) return

          sessionCheckedRef.current = true

          if (error) {
            console.error('Error getting session:', error)
            setLoading(false)
            return
          }

          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            fetchProfile(session.user.id)
          } else {
            profileFetchedRef.current = null
            setProfile(null)
            setRole(null)
            setLoading(false)
          }
        })
        .catch((err) => {
          console.error('Unexpected error getting session:', err)
          if (mounted) setLoading(false)
        })
    } catch (err) {
      console.error('Supabase client initialization failed:', err)
      if (mounted) setLoading(false)
    }

    return () => {
      mounted = false
      if (subscription) subscription.unsubscribe()
    }
  }, [fetchProfile])

  useEffect(() => {
    if (!loading) return
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization timed out — forcing loading state to false')
      setLoading(false)
    }, 15000)
    return () => clearTimeout(timeoutId)
  }, [loading])

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: fullName ? { full_name: fullName } : undefined,
      },
    })
    if (error) setLoading(false)
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setLoading(false)
    return { error }
  }

  const signOut = async () => {
    profileFetchedRef.current = null
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) setLoading(false)
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, role, profile, signUp, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
