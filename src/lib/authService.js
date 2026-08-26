import { supabase, isSupabaseConnected } from './supabaseClient';

/**
 * Get current logged in user session
 */
export async function getCurrentUser() {
  if (isSupabaseConnected) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        return {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          isGuest: false
        };
      }
    } catch (err) {
      console.warn('Supabase auth getSession error:', err);
    }
  }

  // Check localStorage for client session
  if (typeof window !== 'undefined') {
    const localSession = localStorage.getItem('ayezz_user_session');
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        if (parsed && parsed.email && !parsed.isGuest) {
          return parsed;
        }
      } catch (e) {
        localStorage.removeItem('ayezz_user_session');
      }
    }
  }

  return null;
}

/**
 * Login user with email & password
 */
export async function loginUser(email, password) {
  if (isSupabaseConnected) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (data?.user) {
      const userObj = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        isGuest: false
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('ayezz_user_session', JSON.stringify(userObj));
      }
      return userObj;
    }
  }

  // Fallback local login
  const demoUser = {
    id: 'usr_' + Date.now(),
    email,
    fullName: email.split('@')[0],
    isGuest: false
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem('ayezz_user_session', JSON.stringify(demoUser));
  }
  return demoUser;
}

/**
 * Sign up new user
 */
export async function signUpUser(email, password, fullName) {
  if (isSupabaseConnected) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
    if (data?.user) {
      const userObj = {
        id: data.user.id,
        email: data.user.email,
        fullName: fullName || email.split('@')[0],
        isGuest: false
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('ayezz_user_session', JSON.stringify(userObj));
      }
      return userObj;
    }
  }

  const newObj = {
    id: 'usr_' + Date.now(),
    email,
    fullName: fullName || email.split('@')[0],
    isGuest: false
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem('ayezz_user_session', JSON.stringify(newObj));
  }
  return newObj;
}

/**
 * Logout user
 */
export async function logoutUser() {
  if (isSupabaseConnected) {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ayezz_user_session');
  }
}
