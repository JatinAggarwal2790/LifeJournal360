import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import type { ReflectionApiRequest, ReflectionApiResponse, ReflectionMode, PacingPreference } from '@/lib/types';

// Lazy initialization of GoogleGenAI client with server-side API Key
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY server environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Resilient Model Fallback Ladder strictly complying with production directives
const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
] as const;

/**
 * Determine dynamic pacing stage based on preference, turn count, and input density
 */
function determinePacingStage(
  preference: PacingPreference = 'auto',
  turnCount: number,
  promptWordCount: number
): 'crisp' | 'balanced' | 'deep' {
  if (preference === 'crisp') return 'crisp';
  if (preference === 'balanced') return 'balanced';
  if (preference === 'deep') return 'deep';

  // Auto progression: Start crisp by default (turn 1 or short entry), expand as engagement grows
  if (turnCount <= 1 && promptWordCount < 80) {
    return 'crisp';
  } else if (turnCount <= 3 && promptWordCount < 180) {
    return 'balanced';
  } else {
    return 'deep';
  }
}

/**
 * System instructions adapted to specific reflection modes and dynamic pacing
 */
function getSystemInstruction(
  mode: ReflectionMode,
  pacingStage: 'crisp' | 'balanced' | 'deep',
  mood?: string
): string {
  // 1. Core mode persona definition
  let modePersona = '';
  switch (mode) {
    case 'inquiry':
      modePersona = `You are Life Journal 360 in Socratic Inquiry mode. Your purpose is to cut through surface statements and ask 1-2 deeply probing, compassionate questions that challenge hidden assumptions or illuminate blind spots.`;
      break;
    case 'brainstorm':
      modePersona = `You are Life Journal 360 in Strategic Brainstorm mode. Your purpose is to provide pragmatic, high-leverage ideation, actionable frameworks, or concrete next steps directly addressing the user's specific problem.`;
      break;
    case 'perspective_shift':
      modePersona = `You are Life Journal 360 in Perspective Reframe mode. Your purpose is to offer an unexpected, constructive counter-perspective or philosophical reframe that disrupts cognitive loops and expands horizons.`;
      break;
    case 'summary':
      modePersona = `You are Life Journal 360 in Thematic Synthesis mode. Your purpose is to extract core patterns, name the underlying psychological tension, and highlight key growth takeaways with crystal clarity.`;
      break;
    case 'deep_reflection':
    default:
      modePersona = `You are Life Journal 360, an empathetic, intellectually rigorous reflection companion. Your purpose is to act as a clear, grounded mirror that cuts straight to the core dilemma, emotion, or question the user articulated.`;
      break;
  }

  // 2. Strict Pacing & Word Budget rules (Default <= 100 words / 3 lines)
  let pacingDirective = '';
  if (pacingStage === 'crisp') {
    pacingDirective = `
CRITICAL LENGTH & CONCISENESS CONSTRAINT (DEFAULT CRISP MODE):
- Your response MUST BE ultra-crisp, tight, and punchy.
- STRICT LIMIT: Do NOT exceed 60 to 90 words (approximately 2 to 3 concise lines/sentences total).
- NEVER use filler intros or conversational fluff (e.g., do NOT say "Thank you for sharing," "I hear you," "Welcome to your journal," or "Here is what I think").
- Jump straight into the core reflection or direct response to their question with laser precision.`;
  } else if (pacingStage === 'balanced') {
    pacingDirective = `
LENGTH & CONCISENESS CONSTRAINT (BALANCED ENGAGEMENT MODE):
- The user is continuing the reflection. Provide a focused response of approximately 110 to 150 words.
- Offer 1 sharp analytical observation on the core friction and 1 targeted follow-up angle or perspective.
- Keep every sentence high-signal and free of generic pleasantries.`;
  } else {
    pacingDirective = `
LENGTH & DEPTH CONSTRAINT (DEEP ENGAGEMENT MODE):
- The user is deeply engaged in dialogue. Provide a structured, multi-dimensional exploration of approximately 180 to 240 words.
- Connect underlying patterns, explore subtle trade-offs, and synthesize actionable clarity. Use clean, elegant Markdown formatting.`;
  }

  // 3. Mood vs. Content Decoupling rules
  const moodDecouplingDirective = `
MANDATORY GROUNDING & MOOD-CONTENT DECOUPLING DIRECTIVE:
1. The user's typed journal entry and specific question are your SOLE source of truth.
2. The user's selected mood indicator (${mood ? `"${mood}"` : 'None specified'}) is purely high-level context and MUST NOT override what they actually wrote.
3. The mood label might indicate 'Grateful' or 'Energized' or 'Peaceful', but the actual journal entry might describe grief, burnout, anxiety, or relational conflict (or vice versa).
4. NEVER assume the journal content matches the mood tag. NEVER produce toxic positivity, hollow cheerleading, or generic affirmations.
5. Answer the user's specific question or address their actual situation directly with discerning emotional intelligence. If there is dissonance between their mood badge and written reality, reflect the written reality respectfully.`;

  return `${modePersona}\n\n${pacingDirective}\n\n${moodDecouplingDirective}`;
}

/**
 * Resilient Content Generation helper with automatic fallback chain across models
 */
async function generateContentWithFallback(
  ai: GoogleGenAI,
  systemInstruction: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>
): Promise<{ text: string; modelUsed: string }> {
  let lastError: unknown = null;

  for (const modelName of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          temperature: 0.65,
          topP: 0.95,
        },
      });

      const text = response.text || '';
      if (text.trim().length > 0) {
        return { text, modelUsed: modelName };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || (err?.message?.includes('429') ? 429 : 500);
      const isRecoverable = [503, 429, 404, 500].includes(status) || 
        err?.message?.includes('not found') || 
        err?.message?.includes('quota') ||
        err?.message?.includes('overloaded');

      console.warn(`[Gemini Fallback] Model ${modelName} encountered error (status ${status}):`, err?.message || err);

      if (!isRecoverable) {
        // Continue fallback ladder for maximum resilience
      }
    }
  }

  throw lastError || new Error('All fallback models in the Gemini resilience chain were exhausted');
}

export async function POST(req: NextRequest) {
  try {
    // 1. Top-Level Request Deserialization with defensive null-safe parsing
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload in request body' },
        { status: 400 }
      );
    }

    const body: Partial<ReflectionApiRequest> =
      rawBody && typeof rawBody === 'object' ? (rawBody as Partial<ReflectionApiRequest>) : {};

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const mode: ReflectionMode = body.mode && ['deep_reflection', 'inquiry', 'brainstorm', 'perspective_shift', 'summary'].includes(body.mode)
      ? body.mode
      : 'deep_reflection';
    const mood = typeof body.mood === 'string' ? body.mood.trim() : undefined;
    const pacingPreference: PacingPreference = body.pacing && ['auto', 'crisp', 'balanced', 'deep'].includes(body.pacing)
      ? body.pacing
      : 'auto';

    const conversationHistory = Array.isArray(body.conversationHistory)
      ? body.conversationHistory
      : [];

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt content is required' },
        { status: 400 }
      );
    }

    // 2. Secret checking & client retrieval
    let ai: GoogleGenAI;
    try {
      ai = getAiClient();
    } catch (err: any) {
      return NextResponse.json(
        { error: err?.message || 'Server configuration error: Gemini API key missing' },
        { status: 500 }
      );
    }

    // 3. Calculate dynamic pacing stage based on turn count & word volume
    const turnCount = Math.floor(conversationHistory.length / 2) + 1;
    const promptWordCount = prompt.split(/\s+/).filter(Boolean).length;
    const pacingStage = determinePacingStage(pacingPreference, turnCount, promptWordCount);

    // 4. Assemble multi-turn conversation format
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Add previous conversation turns
    for (const msg of conversationHistory) {
      if (typeof msg.content === 'string' && msg.content.trim()) {
        contents.push({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.content.trim() }],
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const systemInstruction = getSystemInstruction(mode, pacingStage, mood);

    // 5. Generate reflection with resilient fallback ladder
    const { text: reply, modelUsed } = await generateContentWithFallback(ai, systemInstruction, contents);

    const wordCount = reply.split(/\s+/).filter(Boolean).length;

    const responsePayload: ReflectionApiResponse = {
      reply,
      modelUsed,
      pacingStage,
      wordCount,
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('Error in /api/reflect:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to generate reflection with Gemini. Please try again.',
      },
      { status: 500 }
    );
  }
}

