export type ReflectionMode =
  | 'deep_reflection'
  | 'inquiry'
  | 'brainstorm'
  | 'perspective_shift'
  | 'summary';

export type PacingPreference = 'auto' | 'crisp' | 'balanced' | 'deep';

export type InteractionEngineMode = 'non_ai' | 'ai_companion';

export type JournalArchetype =
  | 'classic_reflection'
  | 'bullet_tasks'
  | 'multimedia_blog'
  | 'food_diary'
  | 'fitness_tracker'
  | 'pregnancy_milestones'
  | 'travel_log'
  | 'kids_journey'
  | 'custom';

export interface BulletItem {
  id: string;
  type: 'task' | 'note' | 'event' | 'priority' | 'idea';
  content: string;
  completed?: boolean;
  date?: string;
}

export interface MultimediaEntry {
  photos?: Array<{
    url: string;
    caption?: string;
    placeName?: string;
    latitude?: number;
    longitude?: number;
    weather?: string;
  }>;
  videos?: Array<{
    url: string;
    title?: string;
    placeName?: string;
    latitude?: number;
    longitude?: number;
  }>;
  workoutStats?: {
    activityType?: string;
    durationMinutes?: number;
    caloriesBurned?: number;
    steps?: number;
    heartRateAvg?: number;
  };
  music?: {
    trackTitle?: string;
    artist?: string;
    albumOrVibe?: string;
  };
  location?: {
    placeName?: string;
    latitude?: number;
    longitude?: number;
    weather?: string;
  };
  audioNotes?: Array<{
    id: string;
    url?: string;
    durationSeconds?: number;
    transcript?: string;
    recordedAt?: number;
    label?: string;
  }>;
}

export interface SpecializedTrackingData {
  food?: {
    meals?: Array<{
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      items: string;
      calories?: number;
    }>;
    waterGlasses?: number;
    energyRating?: number; // 1-5
  };
  fitness?: {
    workoutType?: string;
    exercises?: Array<{
      name: string;
      sets?: string;
      repsOrWeight?: string;
    }>;
    prNotes?: string;
    recoveryScore?: number; // 1-100
  };
  pregnancy?: {
    weekNumber?: number;
    babySize?: string;
    symptoms?: string[];
    kicksCount?: number;
    notes?: string;
    milestoneLogs?: Array<{
      id: string;
      title: string;
      week?: number;
      date?: string;
      notes?: string;
    }>;
  };
  travel?: {
    destination?: string;
    sightsVisited?: string[];
    transportation?: string;
    localEats?: string;
    costNotes?: string;
  };
  kids?: {
    childName?: string;
    ageOrStage?: string;
    milestone?: string;
    funnyQuote?: string;
    notes?: string;
    milestoneLogs?: Array<{
      id: string;
      title: string;
      category?: string;
      date?: string;
      notes?: string;
    }>;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Life360JourneySynthesis {
  headline: string;
  thoughts: string[];
  insights: string[];
  actionSteps: string[];
  analytics: {
    clarityScore: number; // 0 to 100
    primaryEmotion: string;
    emotionalShift: string;
    growthVelocity: 'High' | 'Steady' | 'Reflective';
    cognitiveFocus: string;
    turnCount: number;
    wordCount: number;
  };
  visualTheme?: 'lime' | 'emerald' | 'amber' | 'teal' | 'violet' | 'coral';
  generatedAt?: number;
}

export interface JournalInteraction {
  id: string;
  userId: string;
  title: string;
  archetype?: JournalArchetype;
  customTypeName?: string;
  customTypeIcon?: string;
  engineMode?: InteractionEngineMode;
  entryDate?: string; // YYYY-MM-DD
  freeformContent?: string;
  bullets?: BulletItem[];
  multimedia?: MultimediaEntry;
  specializedData?: SpecializedTrackingData;
  reflectionMode: ReflectionMode;
  initialPrompt: string;
  messages: ChatMessage[];
  aiSummary?: string;
  journeySynthesis?: Life360JourneySynthesis;
  mood?: string;
  tags?: string[];
  pacingPreference?: PacingPreference;
  createdAt: number;
  updatedAt: number;
}

export interface ReflectionApiRequest {
  prompt: string;
  mode?: ReflectionMode;
  archetype?: JournalArchetype;
  customTypeName?: string;
  customTypeIcon?: string;
  engineMode?: InteractionEngineMode;
  entryDate?: string;
  freeformContent?: string;
  bullets?: BulletItem[];
  multimedia?: MultimediaEntry;
  specializedData?: SpecializedTrackingData;
  mood?: string;
  pacing?: PacingPreference;
  conversationHistory?: Array<{
    role: 'user' | 'model';
    content: string;
  }>;
  title?: string;
}

export interface ReflectionApiResponse {
  reply: string;
  summary?: string;
  journeySynthesis?: Life360JourneySynthesis;
  modelUsed: string;
  pacingStage?: 'crisp' | 'balanced' | 'deep';
  wordCount?: number;
  error?: string;
}



