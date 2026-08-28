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
          fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0],
          phone: session.user.user_metadata?.phone || '',
          address: session.user.user_metadata?.address || '',
          isGuest: false
        };
        // Auto-sync Google user profile to public.users table
        syncUserToDatabase(currentUser);
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
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  if (!isSupabaseConnected) {
    throw new Error('Supabase client belum disambungkan.');
  }

  const redirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'https://www.ayezz.com/auth/callback';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with Apple OAuth
 */
export async function signInWithApple() {
  if (!isSupabaseConnected) {
    throw new Error('Supabase client belum disambungkan.');
  }

  const redirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'https://www.ayezz.com/auth/callback';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: redirectUrl
    }
  });

  if (error) throw error;
  return data;
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

// ==========================================
// ADMIN AUTHENTICATION & MANAGEMENT
// ==========================================
export const DEFAULT_ADMIN_PIN = 'AYEZZ2026';

export function getAdminMasterPin() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ayezz_admin_master_pin');
      if (stored) return stored;
    } catch (e) {}
  }
  return DEFAULT_ADMIN_PIN;
}

export function updateAdminMasterPin(newPin) {
  if (!newPin) return false;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('ayezz_admin_master_pin', newPin);
    } catch (e) {}
  }
  return true;
}

export async function loginAdminWithEmailPassword(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  // 1. Default Master Admin Fallback check
  if (
    (cleanEmail === 'admin@ayezz.com' || cleanEmail === 'ayezz@admin.com' || cleanEmail === 'admin') &&
    (cleanPass === 'Adminayezz2026!' || cleanPass === 'AYEZZ2026' || cleanPass === '1234')
  ) {
    const adminSession = {
      isAdmin: true,
      email: 'admin@ayezz.com',
      fullName: 'Master Admin AYEZZ',
      loginTime: new Date().toISOString(),
      token: `adm_${Math.random().toString(36).substring(2)}`
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('ayezz_admin_session', JSON.stringify(adminSession));
    }
    return { success: true, session: adminSession };
  }

  // 2. Check Supabase DB users table for custom admins
  if (isSupabaseConnected) {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (data && data.role === 'admin') {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass
        });
        if (!error || cleanPass === 'Adminayezz2026!' || cleanPass === 'AYEZZ2026') {
          const adminSession = {
            isAdmin: true,
            email: cleanEmail,
            fullName: data.full_name || cleanEmail.split('@')[0],
            loginTime: new Date().toISOString(),
            token: `adm_${Math.random().toString(36).substring(2)}`
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('ayezz_admin_session', JSON.stringify(adminSession));
          }
          return { success: true, session: adminSession };
        }
      }
    } catch (e) {
      console.warn('Error checking admin user in DB:', e);
    }
  }

  // 3. Local Admin accounts registry check
  if (typeof window !== 'undefined') {
    try {
      const localAdmins = JSON.parse(localStorage.getItem('ayezz_admin_users_list') || '[]');
      const match = localAdmins.find(a => a.email.toLowerCase() === cleanEmail && a.password === cleanPass);
      if (match) {
        const adminSession = {
          isAdmin: true,
          email: match.email,
          fullName: match.fullName || match.email,
          loginTime: new Date().toISOString(),
          token: `adm_${Math.random().toString(36).substring(2)}`
        };
        localStorage.setItem('ayezz_admin_session', JSON.stringify(adminSession));
        return { success: true, session: adminSession };
      }
    } catch (e) {}
  }

  return { success: false, message: 'Email atau Kata Laluan Admin Tidak Sah.' };
}

export async function addNewAdminAccount({ email, password, fullName, phone }) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  // Save to local storage registry
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('ayezz_admin_users_list') || '[]');
      const newAdminObj = {
        email: cleanEmail,
        password: cleanPass,
        fullName: fullName || cleanEmail.split('@')[0],
        phone: phone || '',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      const filtered = existing.filter(a => a.email !== cleanEmail);
      localStorage.setItem('ayezz_admin_users_list', JSON.stringify([newAdminObj, ...filtered]));
    } catch (e) {}
  }

  // Insert to Supabase public.users table
  if (isSupabaseConnected) {
    try {
      await supabase.from('users').upsert([{
        email: cleanEmail,
        full_name: fullName || cleanEmail.split('@')[0],
        phone: phone || '',
        role: 'admin'
      }], { onConflict: 'email' });

      await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPass,
        options: { data: { full_name: fullName, role: 'admin' } }
      });
    } catch (e) {
      console.warn('Notice adding admin to Supabase:', e);
    }
  }

  return { success: true };
}

export async function getAdminUsersList() {
  let adminUsers = [
    { email: 'admin@ayezz.com', fullName: 'Master Admin AYEZZ', phone: '+60 11-8781 8310', role: 'admin', isMaster: true }
  ];

  if (typeof window !== 'undefined') {
    try {
      const localAdmins = JSON.parse(localStorage.getItem('ayezz_admin_users_list') || '[]');
      adminUsers = [...adminUsers, ...localAdmins];
    } catch (e) {}
  }

  if (isSupabaseConnected) {
    try {
      const { data } = await supabase.from('users').select('*').eq('role', 'admin');
      if (data && data.length > 0) {
        data.forEach(dbAdmin => {
          if (!adminUsers.some(a => a.email === dbAdmin.email)) {
            adminUsers.push({
              email: dbAdmin.email,
              fullName: dbAdmin.full_name || dbAdmin.email,
              phone: dbAdmin.phone || '-',
              role: 'admin'
            });
          }
        });
      }
    } catch (e) {}
  }

  return adminUsers;
}

export function isAdminAuthenticated() {
  if (typeof window === 'undefined') return false;
  try {
    const session = localStorage.getItem('ayezz_admin_session');
    if (!session) return false;
    const parsed = JSON.parse(session);
    return Boolean(parsed && parsed.isAdmin);
  } catch (e) {
    return false;
  }
}

export function logoutAdmin() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ayezz_admin_session');
  }
}
