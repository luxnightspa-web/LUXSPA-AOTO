import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generateSpeech,
  generateIllustration,
  chatWithCompanion,
  generateCustomStory,
} from './src/server/geminiService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// API Routes
app.get('/api/status', (_req, res) => {
  res.json({ hasKey: Boolean(process.env.GEMINI_API_KEY) });
});

app.post('/api/tts', async (req, res) => {
  try {
    const result = await generateSpeech(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err?.message || 'TTS Error' });
  }
});

app.post('/api/illustrate', async (req, res) => {
  try {
    const result = await generateIllustration(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Illustration error:', err);
    res.status(500).json({ error: err?.message || 'Illustration Error' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const result = await chatWithCompanion(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err?.message || 'Chat Error' });
  }
});

app.post('/api/generate-story', async (req, res) => {
  try {
    const result = await generateCustomStory(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Story generation error:', err);
    res.status(500).json({ error: err?.message || 'Story generation Error' });
  }
});

// Static assets
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`WonderTales XR server running on port ${port}`);
});
