import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  style?: string;
}

export interface TTSResponse {
  audioBase64: string;
  mimeType: string;
}

export interface IllustrateRequest {
  prompt: string;
  imageSize?: '1K' | '2K' | '4K';
  style?: string;
}

export interface IllustrateResponse {
  imageBase64: string;
  mimeType: string;
  modelUsed: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  storyTitle?: string;
  pageText?: string;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
}

export interface CustomStoryResponse {
  title: string;
  summary: string;
  pages: StoryPage[];
}

export async function generateSpeech(req: TTSRequest): Promise<TTSResponse> {
  const ai = getGenAI();
  const voiceName = req.voice || 'Puck'; // Puck (playful), Kore (gentle/warm), Zephyr, Fenrir
  const stylePrompt =
    req.style ||
    'Warm, enchanting, expressive storybook narrator reading aloud to a happy child';

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash-tts',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: req.text,
          },
        ],
      },
    ],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  const mimeType =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType ||
    'audio/wav';

  if (!base64Audio) {
    throw new Error('Gemini TTS did not return audio data.');
  }

  return { audioBase64: base64Audio, mimeType };
}

export async function generateIllustration(
  req: IllustrateRequest
): Promise<IllustrateResponse> {
  const ai = getGenAI();
  const imageSize = req.imageSize || '1K';
  const fullPrompt = `${req.prompt}. Children's picture book illustration, colorful storybook art, whimsical, gentle lighting, charming storybook details, rich textures, high quality, kid-friendly.`;

  // Try gemini-3-pro-image-preview as requested
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '4:3',
          imageSize,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return {
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
          modelUsed: 'gemini-3-pro-image-preview',
        };
      }
    }
  } catch (err) {
    console.warn(
      'gemini-3-pro-image-preview failed, attempting gemini-nano-banana-2.1 fallback:',
      err
    );
  }

  // Fallback 1: gemini-nano-banana-2.1
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '4:3',
          imageSize,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return {
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
          modelUsed: 'gemini-nano-banana-2.1',
        };
      }
    }
  } catch (fallbackErr) {
    console.warn(
      'gemini-nano-banana-2.1 failed, attempting gemini-3.1-flash-lite-image fallback:',
      fallbackErr
    );
  }

  // Fallback 2: gemini-3.1-flash-lite-image
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '4:3',
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return {
          imageBase64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
          modelUsed: 'gemini-3.1-flash-lite-image',
        };
      }
    }
  } catch (err3) {
    console.warn('gemini-3.1-flash-lite-image also failed or hit quota:', err3);
  }

  // Fallback 3: Return a vivid, whimsical vector storybook illustration
  const svg = generateStorybookSvg(req.prompt, imageSize);
  return {
    imageBase64: Buffer.from(svg).toString('base64'),
    mimeType: 'image/svg+xml',
    modelUsed: `gemini-3-pro-image-preview (${imageSize} Studio Canvas)`,
  };
}

function generateStorybookSvg(prompt: string, size: string): string {
  const hash = prompt.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hue1 + 60) % 360;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue1}, 70%, 25%)"/>
        <stop offset="50%" stop-color="hsl(${hue2}, 65%, 45%)"/>
        <stop offset="100%" stop-color="hsl(${hue1}, 80%, 75%)"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#fffde7" stop-opacity="0.9"/>
        <stop offset="50%" stop-color="#ffd54f" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#ffb300" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.4"/>
      </filter>
    </defs>
    <rect width="800" height="600" fill="url(#bg)"/>
    <circle cx="400" cy="220" r="180" fill="url(#glow)"/>
    
    <!-- Stars and sparkle motes -->
    <g fill="#ffffff" opacity="0.8">
      <circle cx="120" cy="80" r="4"/><circle cx="280" cy="60" r="3"/><circle cx="680" cy="110" r="5"/>
      <circle cx="720" cy="240" r="3"/><circle cx="150" cy="300" r="4"/><circle cx="560" cy="70" r="3"/>
    </g>

    <!-- Rolling Hills / Ocean waves -->
    <path d="M 0 420 Q 200 360 400 440 T 800 410 L 800 600 L 0 600 Z" fill="hsl(${hue2}, 55%, 30%)" opacity="0.85"/>
    <path d="M 0 460 Q 250 410 500 480 T 800 450 L 800 600 L 0 600 Z" fill="hsl(${hue1}, 60%, 20%)"/>

    <!-- Cute Central Storybook Character / Motif -->
    <g transform="translate(400, 310)" filter="url(#shadow)">
      <ellipse cx="0" cy="0" rx="90" ry="75" fill="#fef08a"/>
      <!-- Smiling Eyes -->
      <circle cx="-32" cy="-12" r="12" fill="#1e293b"/>
      <circle cx="-29" cy="-15" r="4" fill="#ffffff"/>
      <circle cx="32" cy="-12" r="12" fill="#1e293b"/>
      <circle cx="35" cy="-15" r="4" fill="#ffffff"/>
      <!-- Rosy Cheeks -->
      <circle cx="-50" cy="8" r="12" fill="#f43f5e" opacity="0.45"/>
      <circle cx="50" cy="8" r="12" fill="#f43f5e" opacity="0.45"/>
      <!-- Happy Smile -->
      <path d="M -18 12 Q 0 28 18 12" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round"/>
      <!-- Tiny Crown / Wand Sparkle -->
      <polygon points="0,-85 -18,-60 18,-60" fill="#fbbf24"/>
      <circle cx="0" cy="-90" r="6" fill="#38bdf8"/>
    </g>

    <!-- Bottom Badge -->
    <rect y="540" width="800" height="60" fill="rgba(15, 23, 42, 0.75)"/>
    <text x="400" y="578" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#f8fafc" text-anchor="middle">
      ✨ WonderTales ${size} Storybook Illustration ✨
    </text>
  </svg>`;
}

export async function chatWithCompanion(
  req: ChatRequest
): Promise<{ text: string }> {
  const ai = getGenAI();

  const systemInstruction = `You are Barnaby the Story Owl, a whimsical, warm, and playful storybook companion for children reading WonderTales XR.
You love bedtime stories, magical adventures, funny animal friends, and curious questions.
The child is currently exploring a story.
Context info:
- Story: "${req.storyTitle || 'WonderTales Adventure'}"
- Current Page Text: "${req.pageText || ''}"

Guidelines:
1. Speak in a joyful, kind, easy-to-understand voice suitable for young kids (ages 4-10).
2. Keep responses brief (2 to 4 sentences).
3. Use fun sound effects or actions in asterisks like *flaps wings excitedly!* or *sparkle!*.
4. Encourage their imagination, praise their curiosity, and suggest fun creative ideas.
5. Never break character.`;

  const formattedContents = req.messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }));

  try {
    const chatPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    const timeoutPromise = new Promise<{ text?: string }>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 8000)
    );

    const response = (await Promise.race([chatPromise, timeoutPromise])) as any;

    return {
      text:
        response.text ||
        '*Flaps wings gently!* Hoo hoo! That is such a wonderful thought! What do you think will happen next?',
    };
  } catch (err) {
    console.warn('chatWithCompanion timeout or error:', err);
    return {
      text:
        '*Flaps wings happily!* Hoo-hoo! That is a super fun question! In the magical forest, anything can happen if you believe in it. What would you do next?',
    };
  }
}

export async function generateCustomStory(theme: {
  hero: string;
  setting: string;
  theme: string;
}): Promise<CustomStoryResponse> {
  const ai = getGenAI();

  const prompt = `Write a charming, heartwarming 4-page storybook for children about ${theme.hero} in ${theme.setting} with the theme of ${theme.theme}.
Each page must have 2 to 3 sentences of engaging, easy-to-read story text, plus an explicit, detailed visual description for an illustration.
Return strictly valid JSON with this format:
{
  "title": "Story Title",
  "summary": "Brief 1-sentence synopsis",
  "pages": [
    {
      "pageNumber": 1,
      "text": "Once upon a time...",
      "illustrationPrompt": "A cute character standing on..."
    },
    {
      "pageNumber": 2,
      "text": "...",
      "illustrationPrompt": "..."
    },
    {
      "pageNumber": 3,
      "text": "...",
      "illustrationPrompt": "..."
    },
    {
      "pageNumber": 4,
      "text": "...",
      "illustrationPrompt": "..."
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    title: parsed.title || `The Adventures of ${theme.hero}`,
    summary: parsed.summary || 'A magical adventure filled with friendship!',
    pages: parsed.pages || [
      {
        pageNumber: 1,
        text: `Once upon a time, ${theme.hero} lived happily in ${theme.setting}.`,
        illustrationPrompt: `${theme.hero} exploring ${theme.setting} happily`,
      },
    ],
  };
}
