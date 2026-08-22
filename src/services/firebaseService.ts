import { db } from '../lib/firebase';
import { collection, doc, setDoc, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

export interface SiteActivityLog {
  id?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  action: 'LOGIN_SUCCESS' | 'LOGOUT' | 'SEARCH_GIFS' | 'FAVORITE_ADD' | 'FAVORITE_REMOVE' | 'API_REQUEST';
  details: string;
  origin: string;
  timestamp: any;
  dateFormatted?: string;
}

/**
 * Registra um log de atividade ou login no Firestore
 */
export async function logSiteActivity(
  user: { id: string; name: string; email?: string } | null,
  action: SiteActivityLog['action'],
  details: string
): Promise<void> {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kaise.space';
    const logsRef = collection(db, 'logs');

    await addDoc(logsRef, {
      userId: user?.id || 'anonymous',
      userName: user?.name || 'Visitante',
      userEmail: user?.email || '',
      action,
      details,
      origin,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Erro ao gravar log no Firestore:', err);
  }
}

/**
 * Salva ou atualiza o perfil do usuário no Firestore
 */
export async function syncUserProfileToFirestore(user: UserProfile): Promise<void> {
  try {
    if (!user.id) return;
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      ...user,
      lastSeen: new Date().toISOString()
    }, { merge: true });

    // Registra log de login
    await logSiteActivity(user, 'LOGIN_SUCCESS', `Login efetuado via ${user.provider || 'Google'}`);
  } catch (err) {
    console.warn('Erro ao sincronizar perfil no Firestore:', err);
  }
}

/**
 * Busca os logs mais recentes de login e atividades do site
 */
export async function fetchRecentSiteLogs(max: number = 30): Promise<SiteActivityLog[]> {
  try {
    const logsRef = collection(db, 'logs');
    const q = query(logsRef, orderBy('createdAt', 'desc'), limit(max));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId || 'anonymous',
        userName: data.userName || 'Visitante',
        userEmail: data.userEmail || '',
        action: data.action || 'API_REQUEST',
        details: data.details || '',
        origin: data.origin || 'kaise.space',
        timestamp: data.timestamp || new Date().toISOString(),
        dateFormatted: data.timestamp ? new Date(data.timestamp).toLocaleString('pt-BR') : 'Recente'
      };
    });
  } catch (err) {
    console.warn('Erro ao buscar logs do Firestore:', err);
    return [];
  }
}
