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
 * Save or overwrite a user journal interaction
 */
export async function saveJournalInteraction(
  userId: string,
  interaction: JournalInteraction
): Promise<void> {
  if (!userId) throw new Error('User must be authenticated to save entries');
  if (!interaction.id) throw new Error('Interaction ID is required');

  const docRef = doc(db, 'users', userId, 'interactions', interaction.id);
  const cleanData = sanitizePayload({
    ...interaction,
    userId,
    updatedAt: Date.now(),
    serverTimestamp: serverTimestamp(),
  });

  await setDoc(docRef, cleanData, { merge: true });
}

/**
 * Fetch all past journal interactions for the authenticated user
 */
export async function fetchUserInteractions(userId: string): Promise<JournalInteraction[]> {
  if (!userId) return [];

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

  return interactions;
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

  const colRef = getInteractionsCollection(userId);
  const q = query(colRef, orderBy('createdAt', 'desc'));

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
      onData(interactions);
    },
    (err) => {
      console.error('Error listening to user interactions:', err);
      onError(err);
    }
  );
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
  const docRef = doc(db, 'users', userId, 'interactions', interactionId);
  await deleteDoc(docRef);
}
