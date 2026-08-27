import { supabase, isSupabaseConnected } from './supabaseClient';

/**
 * Sync user profile to Supabase `users` database table
 */
export async function syncUserToDatabase(userObj) {
  if (!isSupabaseConnected || !userObj?.email) return;
  try {
    const payload = {
      id: userObj.id || `usr_${Date.now()}`,
      email: userObj.email,
      full_name: userObj.fullName || userObj.email.split('@')[0],
      phone: userObj.phone || '',
      address: userObj.address || '',
      role: 'customer'
    };
    const { error } = await supabase.from('users').upsert([payload], { onConflict: 'email' });
    if (error) {
      console.warn('Supabase syncUserToDatabase notice:', error);
    }
  } catch (err) {
    console.warn('Supabase syncUserToDatabase exception:', err);
  }
}

/**
 * Get current logged in user session
 */
export async function getCurrentUser() {
  let currentUser = null;

  if (isSupabaseConnected) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        currentUser = {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          phone: session.user.user_metadata?.phone || '',
          address: session.user.user_metadata?.address || '',
          isGuest: false
        };
      }
    } catch (err) {
      console.warn('Supabase auth getSession error:', err);
    }
  }

  // Check localStorage for client session
  if (!currentUser && typeof window !== 'undefined') {
    const localSession = localStorage.getItem('ayezz_user_session');
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        if (parsed && parsed.email && !parsed.isGuest) {
          currentUser = parsed;
        }
      } catch (e) {
        localStorage.removeItem('ayezz_user_session');
      }
    }
  }

  if (currentUser) {
    // Try to fetch extended database profile details
    if (isSupabaseConnected) {
      try {
        const { data } = await supabase.from('users').select('*').eq('email', currentUser.email).maybeSingle();
        if (data) {
          currentUser.fullName = data.full_name || currentUser.fullName;
          currentUser.phone = data.phone || currentUser.phone;
          currentUser.address = data.address || currentUser.address;
        }
      } catch (e) {}
    }
  }

  return currentUser;
}

/**
 * Login user with email & password
 */
export async function loginUser(email, password) {
  let userObj = null;

  if (isSupabaseConnected) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (!error && data?.user) {
      userObj = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        phone: data.user.user_metadata?.phone || '',
        address: data.user.user_metadata?.address || '',
        isGuest: false
      };
    }
  }

  if (!userObj) {
    userObj = {
      id: 'usr_' + Date.now(),
      email,
      fullName: email.split('@')[0],
      phone: '',
      address: '',
      isGuest: false
    };
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('ayezz_user_session', JSON.stringify(userObj));
  }

  await syncUserToDatabase(userObj);
  return userObj;
}

/**
 * Sign up new user
 */
export async function signUpUser(email, password, fullName) {
  let userObj = null;

  if (isSupabaseConnected) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (!error && data?.user) {
      userObj = {
        id: data.user.id,
        email: data.user.email,
        fullName: fullName || email.split('@')[0],
        phone: '',
        address: '',
        isGuest: false
      };
    }
  }

  if (!userObj) {
    userObj = {
      id: 'usr_' + Date.now(),
      email,
      fullName: fullName || email.split('@')[0],
      phone: '',
      address: '',
      isGuest: false
    };
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('ayezz_user_session', JSON.stringify(userObj));
  }

  await syncUserToDatabase(userObj);
  return userObj;
}

/**
 * Update user profile in Supabase & localStorage
 */
export async function updateUserProfile(profileData) {
  const current = await getCurrentUser();
  if (!current) return null;

  const updated = {
    ...current,
    fullName: profileData.fullName || current.fullName,
    phone: profileData.phone ?? current.phone,
    address: profileData.address ?? current.address
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('ayezz_user_session', JSON.stringify(updated));
  }

  if (isSupabaseConnected) {
    try {
      await supabase.from('users').upsert([{
        id: updated.id,
        email: updated.email,
        full_name: updated.fullName,
        phone: updated.phone,
        address: updated.address,
        role: 'customer'
      }], { onConflict: 'email' });
    } catch (e) {
      console.warn('Error updating user profile in Supabase:', e);
    }
  }

  return updated;
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
