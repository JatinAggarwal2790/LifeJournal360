import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { JournalInteraction } from './types';

/**
 * Strict Undefined-Stripping (Zero-Crash Payload Hygiene)
 * Recursively strips all undefined properties before sending to Firestore
 */
export function sanitizePayload<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (value === undefined ? null : value))
  );
}

/**
 * Helper to get user-isolated subcollection reference
 */
function getInteractionsCollection(userId: string) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid User ID is strictly required for Firestore operations');
  }
  return collection(db, 'users', userId, 'interactions');
}

/**
 * Local Vault Cache Helper for guest sessions or offline resilience
 */
function getLocalVaultKey(userId: string): string {
  return `lifejournal_vault_${userId}`;
}

function getLocalVaultInteractions(userId: string): JournalInteraction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getLocalVaultKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalVaultInteractions(userId: string, list: JournalInteraction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getLocalVaultKey(userId), JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save to local vault cache:', err);
  }
}

/**
 * Save or overwrite a user journal interaction
 */
export async function saveJournalInteraction(
  userId: string,
  interaction: JournalInteraction
): Promise<void> {
  if (!userId) throw new Error('User must be authenticated to save entries');
  if (!interaction.id) throw new Error('Interaction ID is required');

  const cleanData = sanitizePayload({
    ...interaction,
    userId,
    updatedAt: Date.now(),
  });

  // Always update local cache first for instant UI response & offline buffer
  const currentList = getLocalVaultInteractions(userId);
  const existingIdx = currentList.findIndex((i) => i.id === interaction.id);
  let updatedList: JournalInteraction[];
  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = cleanData;
  } else {
    updatedList = [cleanData, ...currentList];
  }
  saveLocalVaultInteractions(userId, updatedList);

  // If local guest account, local storage is the source of truth
  if (userId.startsWith('guest-')) {
    return;
  }

  // Attempt Firestore write with serverTimestamp
  try {
    const docRef = doc(db, 'users', userId, 'interactions', interaction.id);
    await setDoc(
      docRef,
      {
        ...cleanData,
        serverTimestamp: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err: any) {
    console.warn('Firestore cloud sync paused (saved to local vault):', err?.message || err);
    // Don't throw if already safely persisted in local vault
  }
}

/**
 * Fetch all past journal interactions for the authenticated user
 */
export async function fetchUserInteractions(userId: string): Promise<JournalInteraction[]> {
  if (!userId) return [];

  if (userId.startsWith('guest-')) {
    return getLocalVaultInteractions(userId);
  }

  try {
    const colRef = getInteractionsCollection(userId);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const interactions: JournalInteraction[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      interactions.push({
        id: docSnap.id,
        userId: data.userId || userId,
        title: data.title || 'Untitled Reflection',
        archetype: data.archetype || 'classic_reflection',
        engineMode: data.engineMode || 'non_ai',
        entryDate: data.entryDate || new Date().toISOString().split('T')[0],
        freeformContent: data.freeformContent || '',
        bullets: Array.isArray(data.bullets) ? data.bullets : [],
        multimedia: data.multimedia || {},
        specializedData: data.specializedData || {},
        reflectionMode: data.reflectionMode || 'deep_reflection',
        initialPrompt: data.initialPrompt || '',
        messages: Array.isArray(data.messages) ? data.messages : [],
        aiSummary: data.aiSummary || '',
        journeySynthesis: data.journeySynthesis || undefined,
        mood: data.mood || '',
        pacingPreference: data.pacingPreference || 'auto',
        tags: Array.isArray(data.tags) ? data.tags : [],
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
      });
    });

    if (interactions.length > 0) {
      saveLocalVaultInteractions(userId, interactions);
      return interactions;
    }
    return getLocalVaultInteractions(userId);
  } catch (err) {
    console.warn('Firestore fetch fallback to local vault:', err);
    return getLocalVaultInteractions(userId);
  }
}

/**
 * Subscribe in real-time to user's journal interactions
 */
export function subscribeToUserInteractions(
  userId: string,
  onData: (interactions: JournalInteraction[]) => void,
  onError: (err: Error) => void
): () => void {
  if (!userId) {
    onData([]);
    return () => {};
  }

  // If guest mode, immediately emit local vault entries
  if (userId.startsWith('guest-')) {
    onData(getLocalVaultInteractions(userId));
    const handleStorage = () => onData(getLocalVaultInteractions(userId));
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
    return () => {};
  }

  const colRef = getInteractionsCollection(userId);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  try {
    return onSnapshot(
      q,
      (snapshot) => {
        const interactions: JournalInteraction[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          interactions.push({
            id: docSnap.id,
            userId: data.userId || userId,
            title: data.title || 'Untitled Reflection',
            archetype: data.archetype || 'classic_reflection',
            engineMode: data.engineMode || 'non_ai',
            entryDate: data.entryDate || new Date().toISOString().split('T')[0],
            freeformContent: data.freeformContent || '',
            bullets: Array.isArray(data.bullets) ? data.bullets : [],
            multimedia: data.multimedia || {},
            specializedData: data.specializedData || {},
            reflectionMode: data.reflectionMode || 'deep_reflection',
            initialPrompt: data.initialPrompt || '',
            messages: Array.isArray(data.messages) ? data.messages : [],
            aiSummary: data.aiSummary || '',
            journeySynthesis: data.journeySynthesis || undefined,
            mood: data.mood || '',
            pacingPreference: data.pacingPreference || 'auto',
            tags: Array.isArray(data.tags) ? data.tags : [],
            createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
            updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
          });
        });
        saveLocalVaultInteractions(userId, interactions);
        onData(interactions);
      },
      (err) => {
        console.warn('Firestore subscription fallback to local vault cache:', err?.message || err);
        onData(getLocalVaultInteractions(userId));
        onError(err);
      }
    );
  } catch (err: any) {
    onData(getLocalVaultInteractions(userId));
    return () => {};
  }
}

/**
 * Delete a specific interaction document
 */
export async function deleteJournalInteraction(
  userId: string,
  interactionId: string
): Promise<void> {
  if (!userId || !interactionId) {
    throw new Error('User ID and Interaction ID are required for deletion');
  }

  // Remove from local cache
  const list = getLocalVaultInteractions(userId);
  const filtered = list.filter((item) => item.id !== interactionId);
  saveLocalVaultInteractions(userId, filtered);

  if (userId.startsWith('guest-')) {
    return;
  }

  try {
    const docRef = doc(db, 'users', userId, 'interactions', interactionId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete error (deleted from local vault):', err);
  }
}
