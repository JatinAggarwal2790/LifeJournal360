import { GoogleGenAI, Type, Schema } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import type { Life360JourneySynthesis } from '@/lib/types';

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

const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
] as const;

const LIFE360_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    headline: {
      type: Type.STRING,
      description: 'A crisp, meaningful 1-sentence essence of the journey so far (max 10 words)',
    },
    thoughts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2 to 3 core thoughts, struggles, or themes expressed (max 8-10 words per line)',
    },
    insights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2 to 3 sharp breakthroughs, realizations, or perspective shifts (max 10-12 words per line)',
    },
    actionSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2 to 3 immediate, high-leverage micro-actions or commitments (max 8-10 words per line)',
    },
    analytics: {
      type: Type.OBJECT,
      properties: {
        clarityScore: {
          type: Type.INTEGER,
          description: 'Calculated clarity score from 50 to 98 based on coherence & resolution',
        },
        primaryEmotion: {
          type: Type.STRING,
          description: 'Core emotional state captured (e.g. Grounded Focus, Quiet Determination, Relieved)',
        },
        emotionalShift: {
          type: Type.STRING,
          description: 'Trajectory transition (e.g. Overwhelm → Grounded Clarity, Tension → Action)',
        },
        growthVelocity: {
          type: Type.STRING,
          description: 'One of: High, Steady, Reflective',
        },
        cognitiveFocus: {
          type: Type.STRING,
          description: 'Short tag of the primary life domain (e.g. Boundaries, Career Pivot, Self-Compassion, Execution)',
        },
      },
      required: ['clarityScore', 'primaryEmotion', 'emotionalShift', 'growthVelocity', 'cognitiveFocus'],
    },
  },
  required: ['headline', 'thoughts', 'insights', 'actionSteps', 'analytics'],
};

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload in request body' }, { status: 400 });
    }

    const body = rawBody && typeof rawBody === 'object' ? (rawBody as Record<string, any>) : {};
    const conversationHistory: Array<{ role: string; content: string }> = Array.isArray(body.conversationHistory)
      ? body.conversationHistory
      : [];
    const freeformContent = typeof body.freeformContent === 'string' ? body.freeformContent : '';
    const bullets: Array<{ type: string; content: string; completed?: boolean }> = Array.isArray(body.bullets)
      ? body.bullets
      : [];
    const specializedData = body.specializedData && typeof body.specializedData === 'object' ? body.specializedData : {};
    const multimedia = body.multimedia && typeof body.multimedia === 'object' ? body.multimedia : {};
    const archetype = typeof body.archetype === 'string' ? body.archetype : 'classic_reflection';
    const entryDate = typeof body.entryDate === 'string' ? body.entryDate : '';
    const mood = typeof body.mood === 'string' ? body.mood : '';
    const title = typeof body.title === 'string' ? body.title : 'Reflection';

    // Compile comprehensive source text whether from conversation or direct non-AI journal entry
    let compiledSourceText = '';
    if (conversationHistory.length > 0) {
      compiledSourceText += conversationHistory
        .map((m) => `${m.role === 'user' ? 'Journaler' : 'AI Companion'}: ${m.content}`)
        .join('\n\n');
    }
    if (freeformContent.trim()) {
      compiledSourceText += `\n\n=== Journal Entry / Written Thoughts ===\n${freeformContent.trim()}`;
    }
    if (bullets.length > 0) {
      compiledSourceText += `\n\n=== Structured Tasks & Rapid Logs ===\n` +
        bullets.map((b) => `• [${b.type.toUpperCase()}] ${b.completed ? '(Completed) ' : ''}${b.content}`).join('\n');
    }
    if (multimedia.workoutStats || multimedia.music || multimedia.location) {
      compiledSourceText += `\n\n=== Memory & Context Data ===\n` +
        (multimedia.workoutStats ? `Workout: ${multimedia.workoutStats.activityType || 'Active'} - ${multimedia.workoutStats.durationMinutes || 0}m, ${multimedia.workoutStats.caloriesBurned || 0} kcal\n` : '') +
        (multimedia.music ? `Soundtrack: "${multimedia.music.trackTitle || ''}" by ${multimedia.music.artist || ''} (${multimedia.music.albumOrVibe || ''})\n` : '') +
        (multimedia.location ? `Location: ${multimedia.location.placeName || ''} (${multimedia.location.weather || ''})\n` : '');
    }
    if (Object.keys(specializedData).length > 0) {
      compiledSourceText += `\n\n=== Specialized Log Details (${archetype}) ===\n${JSON.stringify(specializedData, null, 2)}`;
    }

    if (!compiledSourceText.trim()) {
      return NextResponse.json({ error: 'No journal content or conversation provided to synthesize' }, { status: 400 });
    }

    let ai: GoogleGenAI;
    try {
      ai = getAiClient();
    } catch (err: any) {
      return NextResponse.json(
        { error: err?.message || 'Server configuration error: Gemini API key missing' },
        { status: 500 }
      );
    }

    // Determine visual theme based on selected mood
    const getMoodTheme = (m: string): 'amber' | 'emerald' | 'teal' | 'lime' | 'violet' | 'coral' => {
      const lower = m.toLowerCase();
      if (lower.includes('grateful') || lower.includes('peace') || lower.includes('warm') || lower.includes('sunny')) return 'amber';
      if (lower.includes('ground') || lower.includes('clear') || lower.includes('calm') || lower.includes('zen')) return 'emerald';
      if (lower.includes('overwhelm') || lower.includes('anxious') || lower.includes('tired') || lower.includes('heavy')) return 'teal';
      if (lower.includes('energiz') || lower.includes('excite') || lower.includes('focus') || lower.includes('bold')) return 'lime';
      if (lower.includes('torn') || lower.includes('conflict') || lower.includes('reflect') || lower.includes('lost')) return 'violet';
      if (lower.includes('restless') || lower.includes('driven') || lower.includes('passion') || lower.includes('fire')) return 'coral';
      return 'emerald';
    };

    const visualTheme = getMoodTheme(mood);

    const totalWords = compiledSourceText.split(/\s+/).filter(Boolean).length;
    const turnCount = Math.max(1, Math.floor(conversationHistory.length / 2) + (bullets.length > 0 ? 1 : 0));

    // Collect user text phrases
    const userMessages = conversationHistory.filter((m) => m.role === 'user').map((m) => m.content);
    if (freeformContent) userMessages.push(freeformContent);
    bullets.forEach((b) => userMessages.push(b.content));

    const systemPrompt = `You are ReflectAI's visual Life360 & Journey Synthesizer.
Your goal is to extract a vibrant, engaging, and strictly validated snapshot of ONLY the current conversation.

CRITICAL BOUNDARY ENFORCEMENT RULES:
1. STRICT BOUNDARIES: You MUST synthesize ONLY facts, dilemmas, emotions, and topics explicitly stated in the provided transcript.
2. DO NOT hallucinate, assume, or inject generic productivity advice, unrelated life goals, or external topics not present in this transcript.
3. Every thought MUST mirror the user's actual expressed words/situation in this session.
4. Every insight MUST be a direct realization from the dialogue exchanges in this session.
5. Every action step MUST be a concrete, immediate micro-step specifically tailored to what the user talked about in this session.
6. NO CORPORATE JARGON or vague filler (e.g. no "optimize synergies", no "execute strategy"). Keep it personal, authentic, and inspiring.
7. Concise length:
   - 'thoughts': 2-3 short chips (max 8-10 words each) capturing the core dilemma/context of this session.
   - 'insights': 2-3 memorable perspective shifts or psychological breakthroughs (max 10-12 words each).
   - 'actionSteps': 2-3 high-leverage micro-commitments (max 8-10 words each).
8. 'analytics':
   - clarityScore: integer between 65 and 98 based on how well the dilemma was processed.
   - primaryEmotion: short 2-3 word phrase reflecting the emotional tone of this dialogue.
   - emotionalShift: short transition capturing the trajectory of this session (e.g. "Tension → Grounded Action").
   - growthVelocity: "High" | "Steady" | "Reflective"
   - cognitiveFocus: 1-2 word domain tag directly matching the topic discussed.

Output strictly in the specified JSON format.`;

    let synthesisData: Life360JourneySynthesis | null = null;
    let modelUsed = 'gemini-3.6-flash';

    for (const modelName of MODEL_FALLBACK_LADDER) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Analyze ONLY the following journal / reflection entries and provide the strictly bounded Life360 Journey synthesis JSON.\n\nSession Title: ${title}\nDate: ${entryDate || 'Today'}\nArchetype: ${archetype}\nContext Mood: ${mood || 'Reflective'}\n\nJournal Content of Current Session:\n${compiledSourceText}`,
                },
              ],
            },
          ],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: LIFE360_SCHEMA,
            temperature: 0.25,
          },
        });

        const rawText = response.text || '';
        if (rawText.trim()) {
          const parsed = JSON.parse(rawText);
          if (parsed && parsed.headline && Array.isArray(parsed.thoughts) && parsed.thoughts.length > 0) {
            // Strict Boundary Sanitization: Filter out empty strings
            const thoughts = parsed.thoughts.map(String).filter((t: string) => t.trim().length > 0);
            const insights = Array.isArray(parsed.insights)
              ? parsed.insights.map(String).filter((i: string) => i.trim().length > 0)
              : [];
            const actionSteps = Array.isArray(parsed.actionSteps)
              ? parsed.actionSteps.map(String).filter((a: string) => a.trim().length > 0)
              : [];

            synthesisData = {
              headline: String(parsed.headline || 'Clarity on Current Reflection'),
              thoughts: thoughts.slice(0, 3),
              insights: insights.slice(0, 3),
              actionSteps: actionSteps.slice(0, 3),
              analytics: {
                clarityScore: typeof parsed.analytics?.clarityScore === 'number' ? parsed.analytics.clarityScore : 88,
                primaryEmotion: String(parsed.analytics?.primaryEmotion || mood || 'Focused Clarity'),
                emotionalShift: String(parsed.analytics?.emotionalShift || 'Uncertainty → Direction'),
                growthVelocity: ['High', 'Steady', 'Reflective'].includes(parsed.analytics?.growthVelocity)
                  ? parsed.analytics.growthVelocity
                  : 'Steady',
                cognitiveFocus: String(parsed.analytics?.cognitiveFocus || 'Personal Focus'),
                turnCount,
                wordCount: totalWords,
              },
              visualTheme: visualTheme as any,
              generatedAt: Date.now(),
            };
            modelUsed = modelName;
            break;
          }
        }
      } catch (err: any) {
        console.warn(`[Synthesize Fallback] Model ${modelName} encountered error:`, err?.message || err);
      }
    }

    // Safety fallback using verbatim user messages from the current conversation
    if (!synthesisData) {
      const firstUserMsg = userMessages[0] || 'Current reflection topic';
      const lastUserMsg = userMessages[userMessages.length - 1] || firstUserMsg;
      const snippet1 = firstUserMsg.length > 60 ? `${firstUserMsg.substring(0, 57)}...` : firstUserMsg;
      const snippet2 = lastUserMsg !== firstUserMsg
        ? (lastUserMsg.length > 60 ? `${lastUserMsg.substring(0, 57)}...` : lastUserMsg)
        : 'Exploring the root feelings and key decision points.';

      synthesisData = {
        headline: `Alignment on ${title || 'Current Reflection'}`,
        thoughts: [
          `Focusing on: "${snippet1}"`,
          snippet2.startsWith('Focusing') ? snippet2 : `Working through: "${snippet2}"`,
        ],
        insights: [
          'Recognizing core tension by directly exploring the issue.',
          'Small deliberate shifts create room for lasting clarity.',
        ],
        actionSteps: [
          `Follow through on the key decision regarding ${title || 'today\'s focus'}.`,
          'Protect space for mindful pause before responding to pressure.',
        ],
        analytics: {
          clarityScore: 84,
          primaryEmotion: mood || 'Calm Reflection',
          emotionalShift: 'Ambiguity → Actionable Resolve',
          growthVelocity: 'Steady',
          cognitiveFocus: title || 'Current Focus',
          turnCount,
          wordCount: totalWords,
        },
        visualTheme: visualTheme as any,
        generatedAt: Date.now(),
      };
    }

    return NextResponse.json({
      success: true,
      journeySynthesis: synthesisData,
      modelUsed,
    });
  } catch (err: any) {
    console.error('Error in /api/synthesize:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to synthesize reflection journey' },
      { status: 500 }
    );
  }
}
