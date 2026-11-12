import { ImageResolution, CustomStoryResponse } from '../types.ts';

class SoundNarrator {
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeaking = false;

  public stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  public get speaking(): boolean {
    return this.isSpeaking;
  }

  public async playGeminiWav(
    base64Data: string,
    mimeType = 'audio/wav',
    onEnd?: () => void
  ): Promise<void> {
    this.stopAudio();
    this.isSpeaking = true;

    try {
      const audioUrl = `data:${mimeType};base64,${base64Data}`;
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        this.isSpeaking = false;
        this.currentAudio = null;
        onEnd?.();
      };

      audio.onerror = (e) => {
        console.warn('HTMLAudio error, falling back to speech synthesis:', e);
        this.isSpeaking = false;
        this.currentAudio = null;
        onEnd?.();
      };

      await audio.play();
    } catch (err) {
      console.warn('Playback error:', err);
      this.isSpeaking = false;
      this.currentAudio = null;
      onEnd?.();
    }
  }

  public speakBrowserFallback(
    text: string,
    onEnd?: () => void
  ): void {
    this.stopAudio();
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    this.isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.15; // friendly, cheerful pitch for kids
    utterance.rate = 0.92; // slightly slower, clear story pace

    utterance.onend = () => {
      this.isSpeaking = false;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const narrator = new SoundNarrator();

export async function checkServerStatus(): Promise<{ hasKey: boolean }> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) return { hasKey: false };
    return await res.json();
  } catch {
    return { hasKey: false };
  }
}

export async function requestTTS(
  text: string,
  voice = 'Puck',
  onEnd?: () => void
): Promise<void> {
  narrator.stopAudio();
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice,
        style: 'Warm, whimsical, expressive children audiobook narrator',
      }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      console.warn('Server TTS failed, using browser speech synthesis:', errorJson);
      narrator.speakBrowserFallback(text, onEnd);
      return;
    }

    const data = await res.json();
    if (data.audioBase64) {
      await narrator.playGeminiWav(data.audioBase64, data.mimeType || 'audio/wav', onEnd);
    } else {
      narrator.speakBrowserFallback(text, onEnd);
    }
  } catch (err) {
    console.warn('Network error requesting TTS:', err);
    narrator.speakBrowserFallback(text, onEnd);
  }
}

export async function requestIllustration(
  prompt: string,
  imageSize: ImageResolution = '1K'
): Promise<{ imageUrl: string; modelUsed: string }> {
  const res = await fetch('/api/illustrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      imageSize,
    }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || 'Failed to generate illustration');
  }

  const data = await res.json();
  if (!data.imageBase64) {
    throw new Error('No image returned from Gemini');
  }

  const mime = data.mimeType || 'image/png';
  return {
    imageUrl: `data:${mime};base64,${data.imageBase64}`,
    modelUsed: data.modelUsed || 'gemini-3-pro-image-preview',
  };
}

export async function requestChatWithOwl(
  messages: Array<{ role: 'user' | 'model'; text: string }>,
  storyTitle?: string,
  pageText?: string
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      storyTitle,
      pageText,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Companion chat failed');
  }

  const data = await res.json();
  return data.text || 'Hoo hoo! That sounds magical!';
}

export async function requestCustomStory(theme: {
  hero: string;
  setting: string;
  theme: string;
}): Promise<CustomStoryResponse> {
  const res = await fetch('/api/generate-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(theme),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Story generator failed');
  }

  return await res.json();
}
