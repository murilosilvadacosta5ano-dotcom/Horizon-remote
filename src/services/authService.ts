import { UserProfile, SavedFavoriteGif } from '../types';

export const AUTH_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || "AIzaSyAN6qMN7FDIiSDLcfy1-QtSO15riaKFJzE";
export const DEFAULT_AUTHORIZED_REDIRECT_URL = "https://www.kaise.space";

const STORAGE_KEY = 'kaise_user_profile';
const FAVORITES_KEY = 'kaise_saved_favorites';
const AUTO_REDIRECT_KEY = 'kaise_auto_redirect_after_login';

export function getAutoRedirectPreference(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(AUTO_REDIRECT_KEY);
  return stored !== null ? stored === 'true' : true; // default true as requested
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
    url.searchParams.set('user_email', currentUser.email);
    url.searchParams.set('provider', 'google');
  }

  window.location.href = url.toString();
}

const DEFAULT_GOOGLE_ACCOUNTS: Array<{ name: string; email: string; avatar: string; birthDate: string }> = [
  {
    name: 'Murilo Silva',
    email: 'murilosilvadacosta5ano@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    birthDate: '2012-05-14'
  },
  {
    name: 'Dev Kaise',
    email: 'dev@kaise.space',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    birthDate: '2000-08-20'
  }
];

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
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
 * Realiza o Login via Google
 * Cria ou recupera o perfil conectado do Google com Foto, Nome, Email e Data de Nascimento
 */
export async function performGoogleLogin(customDetails?: {
  name?: string;
  email?: string;
  avatar?: string;
  birthDate?: string;
}): Promise<UserProfile> {
  // Simula o tempo de resposta do popup Google OAuth
  await new Promise(resolve => setTimeout(resolve, 600));

  const existing = getStoredUser();
  const currentFavs = getStoredFavorites();

  const chosenAccount = customDetails || DEFAULT_GOOGLE_ACCOUNTS[0];

  const user: UserProfile = {
    id: existing?.id || `google_${Math.random().toString(36).substring(2, 11)}`,
    name: chosenAccount.name || existing?.name || 'Usuário Google',
    email: chosenAccount.email || existing?.email || 'usuario@gmail.com',
    avatar: chosenAccount.avatar || existing?.avatar || DEFAULT_GOOGLE_ACCOUNTS[0].avatar,
    birthDate: chosenAccount.birthDate || existing?.birthDate || '2005-01-01',
    provider: 'google',
    createdAt: existing?.createdAt || new Date().toISOString(),
    favorites: existing?.favorites && existing.favorites.length > 0 ? existing.favorites : currentFavs
  };

  saveStoredUser(user);
  return user;
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
