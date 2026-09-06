'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { JournalInteraction, JournalArchetype } from '@/lib/types';
import { subscribeToUserInteractions, deleteJournalInteraction } from '@/lib/firestore-service';
import { Navbar } from './Navbar';
import { ChooseJournalingHub } from './ChooseJournalingHub';
import { ActiveReflectionSession } from './ActiveReflectionSession';
import { HistoryView } from './HistoryView';
import { StickyNotesShelf } from './StickyNotesShelf';

export function Dashboard() {
  const { user } = useAuth();
  // Choose journaling is the first page after the user is signed in
  const [currentView, setCurrentView] = useState<'choose' | 'active' | 'history'>('choose');
  const [interactions, setInteractions] = useState<JournalInteraction[]>([]);
  const [selectedInteraction, setSelectedInteraction] = useState<JournalInteraction | null>(null);
  const [isStickyShelfOpen, setIsStickyShelfOpen] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Subscribe to real-time Firestore updates under the user's isolated subcollection
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUserInteractions(
      user.uid,
      (data) => {
        setInteractions(data);
        setDbError(null);
        // If the selected interaction was updated in Firestore, keep our local reference updated
        setSelectedInteraction((prev) => {
          if (!prev) return null;
          const updated = data.find((d) => d.id === prev.id);
          return updated || null;
        });
      },
      (err) => {
        console.error('Real-time sync error:', err);
        setDbError(err.message || 'Firestore connection issue');
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const handleSelectInteractionToContinue = (interaction: JournalInteraction) => {
    setSelectedInteraction(interaction);
    setCurrentView('active');
    // On mobile screens, automatically close shelf after selection
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsStickyShelfOpen(false);
    }
  };

  /**
   * Launch a chosen journaling journey (with auto-generated title if none was typed)
   */
  const handleSelectJourney = (config: {
    archetype: JournalArchetype;
    customTypeName?: string;
    customTypeIcon?: string;
    title?: string;
  }) => {
    const todayFormatted = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

    const defaultTitle =
      config.title ||
      (config.archetype === 'custom' && config.customTypeName
        ? `${config.customTypeName} – ${todayFormatted}`
        : `${config.archetype.replace('_', ' ').toUpperCase()} – ${todayFormatted}`);

    const newSessionData: JournalInteraction = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.uid || '',
      title: defaultTitle,
      archetype: config.archetype,
      customTypeName: config.customTypeName,
      customTypeIcon: config.customTypeIcon,
      engineMode: 'non_ai',
      entryDate: new Date().toISOString().split('T')[0],
      freeformContent: '',
      bullets: [],
      multimedia: {},
      specializedData: {},
      reflectionMode: 'deep_reflection',
      initialPrompt: '',
      messages: [],
      tags: [config.archetype, ...(config.customTypeName ? [config.customTypeName] : [])],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSelectedInteraction(newSessionData);
    setCurrentView('active');

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsStickyShelfOpen(false);
    }
  };

  /**
   * Start fresh session: navigate to choose journey hub or directly instantiate a category
   */
  const handleStartNewSession = (archetype?: JournalArchetype, customTypeName?: string) => {
    if (archetype) {
      handleSelectJourney({
        archetype,
        customTypeName,
      });
    } else {
      setSelectedInteraction(null);
      setCurrentView('choose');
    }
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    if (!user?.uid || !interactionId) return;
    try {
      await deleteJournalInteraction(user.uid, interactionId);
      if (selectedInteraction?.id === interactionId) {
        setSelectedInteraction(null);
        setCurrentView('choose');
      }
    } catch (err) {
      console.error('Failed to delete interaction:', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans bg-grid-pattern selection:bg-lime-400 selection:text-zinc-950">
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
        }}
        entriesCount={interactions.length}
      />

      {/* Quick Sticky Notes Shelf on the Left (Categorized by Type) */}
      <StickyNotesShelf
        interactions={interactions}
        activeInteractionId={selectedInteraction?.id}
        onSelectInteraction={handleSelectInteractionToContinue}
        onStartNew={handleStartNewSession}
        onDeleteInteraction={handleDeleteInteraction}
        isOpen={isStickyShelfOpen}
        onToggleOpen={() => setIsStickyShelfOpen(!isStickyShelfOpen)}
      />

      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0 ${isStickyShelfOpen ? 'md:pl-72' : 'pl-0'}`}>
        {currentView === 'choose' ? (
          <ChooseJournalingHub
            onSelectJourney={handleSelectJourney}
            onOpenStickyNotes={() => setIsStickyShelfOpen(true)}
            entriesCount={interactions.length}
            interactions={interactions}
            onSelectInteraction={handleSelectInteractionToContinue}
            onDeleteInteraction={handleDeleteInteraction}
            activeInteractionId={selectedInteraction?.id}
          />
        ) : currentView === 'active' ? (
          <ActiveReflectionSession
            key={selectedInteraction?.id || 'new_session'}
            initialInteraction={selectedInteraction}
            onSaved={() => {
              // Real-time listener handles state update
            }}
            onStartNew={() => handleStartNewSession()}
            onToggleStickyNotes={() => setIsStickyShelfOpen(!isStickyShelfOpen)}
            isStickyNotesOpen={isStickyShelfOpen}
            stickyNotesCount={interactions.length}
          />
        ) : (
          <HistoryView
            userId={user?.uid || ''}
            interactions={interactions}
            onSelectInteraction={handleSelectInteractionToContinue}
          />
        )}
      </main>
    </div>
  );
}
