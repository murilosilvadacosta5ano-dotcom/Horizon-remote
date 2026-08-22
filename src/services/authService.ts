import { UserProfile, SavedFavoriteGif } from '../types';

export const DEFAULT_AUTHORIZED_REDIRECT_URL = "https://www.kaise.space";

const STORAGE_KEY = 'kaise_user_profile';
const FAVORITES_KEY = 'kaise_saved_favorites';
const AUTO_REDIRECT_KEY = 'kaise_auto_redirect_after_login';
const PENDING_TERMS_USER_KEY = 'kaise_pending_terms_user';

export const DEFAULT_GOOGLE_CLIENT_ID = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) || 
  "867223583700-u5lteb4ihfhpdw5rhezwjp.apps.googleusercontent.com";

let cachedClientId: string | null = null;

export async function getGoogleClientId(): Promise<string> {
  if (cachedClientId) return cachedClientId;
  try {
    const res = await fetch('/api/auth/google/config');
    if (res.ok) {
      const data = await res.json();
      if (data.clientId) {
        cachedClientId = data.clientId;
        return data.clientId;
      }
    }
  } catch (err) {
    console.warn('Erro ao obter client_id dinâmico:', err);
  }
  cachedClientId = DEFAULT_GOOGLE_CLIENT_ID;
  return cachedClientId;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
            error_callback?: (err: any) => void;
          }) => { requestAccessToken: (overrideConfig?: any) => void };
        };
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notificationCallback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

/**
 * Garante que o SDK oficial do Google Identity Services (GSI) esteja carregado na página
 */
export async function ensureGoogleGsiLoaded(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.google?.accounts?.oauth2) return true;

  return new Promise((resolve) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 30) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 20) {
          clearInterval(interval);
          resolve(false);
        }
      }, 50);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export function getAutoRedirectPreference(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(AUTO_REDIRECT_KEY);
  return stored === 'true';
}

export function setAutoRedirectPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTO_REDIRECT_KEY, String(enabled));
}

/**
 * Redireciona a sessão autorizada para www.kaise.space ou URL personalizada
 */
export function redirectToAuthorizedDomain(user?: UserProfile | null, targetUrl: string = DEFAULT_AUTHORIZED_REDIRECT_URL): void {
  if (typeof window === 'undefined') return;
  
  const currentUser = user || getStoredUser();
  const url = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
  
  if (currentUser) {
    url.searchParams.set('auth', 'authorized');
    url.searchParams.set('user_name', currentUser.name);
    url.searchParams.set('user_username', currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''));
    url.searchParams.set('user_nickname', currentUser.nickname || currentUser.name);
    url.searchParams.set('user_avatar', currentUser.avatar);
    url.searchParams.set('provider', 'google');
    if (currentUser.termsAccepted) {
      url.searchParams.set('terms_accepted', 'true');
    }
  }

  window.location.href = url.toString();
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user: UserProfile = JSON.parse(raw);
    if (!user.username) {
      user.username = `@${user.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_]/g, '') || 'usuario'}`;
    }
    if (!user.nickname) {
      user.nickname = user.name.split(' ')[0] || user.name;
    }
    return user;
  } catch {
    return null;
  }
}

import { syncUserProfileToFirestore, logSiteActivity } from './firebaseService';

export function saveStoredUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    const current = getStoredUser();
    if (current) {
      logSiteActivity(current, 'LOGOUT', 'Usuário encerrou a sessão no site');
    }
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    // Sincroniza em segundo plano com o Firebase Firestore
    syncUserProfileToFirestore(user).catch(err => console.warn('Erro sync Firebase:', err));
  }
}

export function getPendingTermsUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PENDING_TERMS_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setPendingTermsUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    sessionStorage.removeItem(PENDING_TERMS_USER_KEY);
  } else {
    sessionStorage.setItem(PENDING_TERMS_USER_KEY, JSON.stringify(user));
  }
}

export function acceptTermsForUser(user: UserProfile): UserProfile {
  const updated: UserProfile = {
    ...user,
    termsAccepted: true,
    termsAcceptedAt: new Date().toISOString()
  };
  saveStoredUser(updated);
  setPendingTermsUser(null);
  return updated;
}

export function getStoredFavorites(): SavedFavoriteGif[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredFavorites(favs: SavedFavoriteGif[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

/**
 * Converte um arquivo de imagem enviado da galeria do dispositivo em DataURL Base64
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Por favor, selecione apenas arquivos de imagem (PNG, JPG, WEBP, GIF).'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('A imagem deve ter no máximo 5MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Executa o Login REAL com o Google via OAuth 2.0 Popup
 * Abre a janela oficial do Google diretamente e recebe a resposta autenticada.
 */
export async function performRealGoogleSignIn(): Promise<UserProfile> {
  const currentFavs = getStoredFavorites();
  const clientId = await getGoogleClientId();

  // 1. Tenta o Fluxo Direto Google OAuth 2.0 Popup com postMessage
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectUri = `${origin}/auth/google/callback`;
    const scopes = 'openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&prompt=select_account` +
      `&include_granted_scopes=true`;

    const authPromise = new Promise<any>((resolve, reject) => {
      let popupClosedChecker: NodeJS.Timeout;

      const messageListener = (event: MessageEvent) => {
        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.userinfo) {
          window.removeEventListener('message', messageListener);
          if (popupClosedChecker) clearInterval(popupClosedChecker);
          resolve(event.data.userinfo);
        } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
          window.removeEventListener('message', messageListener);
          if (popupClosedChecker) clearInterval(popupClosedChecker);
          reject(new Error(event.data.error || 'Erro na autenticação do Google'));
        }
      };

      window.addEventListener('message', messageListener);

      const width = 520;
      const height = 640;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        googleAuthUrl,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no,location=no`
      );

      if (!popup) {
        window.removeEventListener('message', messageListener);
        reject(new Error('A janela popup foi bloqueada pelo navegador. Permita popups para realizar login com o Google.'));
        return;
      }

      popupClosedChecker = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupClosedChecker);
          window.removeEventListener('message', messageListener);
          setTimeout(() => {
            reject(new Error('Login cancelado: a janela do Google foi fechada.'));
          }, 600);
        }
      }, 800);
    });

    const gUser = await authPromise;
    const displayName = gUser.name || gUser.given_name || 'Usuário';
    const givenName = gUser.given_name || displayName.split(' ')[0] || 'Usuário';
    const rawEmail = gUser.email || '';
    const emailPrefix = rawEmail ? rawEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') : givenName.toLowerCase().replace(/[^a-z0-9_]/g, '');

    const realUserProfile: UserProfile = {
      id: `google_${gUser.sub || Math.random().toString(36).substring(2, 11)}`,
      name: displayName,
      username: `@${emailPrefix || 'usuario'}`,
      nickname: givenName,
      email: rawEmail,
      avatar: gUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2481cc&color=fff&size=200`,
      bio: 'Colecionador de figurinhas e GIFs animados! ✨',
      provider: 'google',
      createdAt: new Date().toISOString(),
      termsAccepted: false,
      favorites: currentFavs
    };

    return realUserProfile;
  } catch (err: any) {
    if (err?.message && (err.message.includes('fechada') || err.message.includes('bloqueada') || err.message.includes('cancelado'))) {
      throw err;
    }

    // 2. Fallback caso popup seja bloqueado: Google Identity Services (GSI)
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      try {
        const tokenResponse = await new Promise<{ access_token?: string; error?: string }>((resolve, reject) => {
          const client = window.google!.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: (res) => {
              if (res.access_token) resolve(res);
              else reject(new Error(res.error || 'Erro no token Google'));
            }
          });
          client.requestAccessToken({ prompt: 'select_account' });
        });

        if (tokenResponse.access_token) {
          const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          });
          if (userinfoRes.ok) {
            const gUser = await userinfoRes.json();
            const displayName = gUser.name || gUser.given_name || 'Usuário';
            const givenName = gUser.given_name || displayName.split(' ')[0] || 'Usuário';
            const rawEmail = gUser.email || '';
            const emailPrefix = rawEmail ? rawEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') : givenName.toLowerCase().replace(/[^a-z0-9_]/g, '');

            return {
              id: `google_${gUser.sub || Math.random().toString(36).substring(2, 11)}`,
              name: displayName,
              username: `@${emailPrefix || 'usuario'}`,
              nickname: givenName,
              email: rawEmail,
              avatar: gUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2481cc&color=fff&size=200`,
              bio: 'Colecionador de figurinhas e GIFs animados! ✨',
              provider: 'google',
              createdAt: new Date().toISOString(),
              termsAccepted: false,
              favorites: currentFavs
            };
          }
        }
      } catch (gsiErr) {
        console.warn('GSI fallback falhou:', gsiErr);
      }
    }

    throw new Error(err?.message || 'Erro ao realizar login com o Google.');
  }
}

export function updateUserProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getStoredUser();
  if (!current) {
    throw new Error('Nenhum usuário logado para atualizar.');
  }

  const updated: UserProfile = {
    ...current,
    ...updates,
    favorites: updates.favorites || current.favorites
  };

  saveStoredUser(updated);
  return updated;
}

export function logoutUser(): void {
  saveStoredUser(null);
  setPendingTermsUser(null);
}

export function toggleFavorite(gif: { id: string; title: string; url: string; category?: string }): {
  isFavorite: boolean;
  favorites: SavedFavoriteGif[];
} {
  const user = getStoredUser();
  let currentFavs = user?.favorites || getStoredFavorites();

  const existsIndex = currentFavs.findIndex(f => f.url === gif.url);
  let isFav = false;

  if (existsIndex >= 0) {
    currentFavs = currentFavs.filter((_, idx) => idx !== existsIndex);
    isFav = false;
  } else {
    const newFav: SavedFavoriteGif = {
      id: gif.id,
      title: gif.title,
      url: gif.url,
      category: gif.category || 'Geral',
      savedAt: new Date().toLocaleDateString('pt-BR')
    };
    currentFavs = [newFav, ...currentFavs];
    isFav = true;
  }

  saveStoredFavorites(currentFavs);

  if (user) {
    user.favorites = currentFavs;
    saveStoredUser(user);
  }

  return { isFavorite: isFav, favorites: currentFavs };
}

export function checkIsFavorite(gifUrl: string): boolean {
  const user = getStoredUser();
  const list = user?.favorites || getStoredFavorites();
  return list.some(f => f.url === gifUrl);
}
