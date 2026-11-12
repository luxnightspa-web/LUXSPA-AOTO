import { defineConfig, type Plugin } from 'vite';
import {
  generateSpeech,
  generateIllustration,
  chatWithCompanion,
  generateCustomStory,
} from './src/server/geminiService.ts';

function apiPlugin(): Plugin {
  return {
    name: 'gemini-api-endpoints',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        let body: any = {};
        if (req.method === 'POST') {
          const buffers: Buffer[] = [];
          for await (const chunk of req) {
            buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }
          const raw = Buffer.concat(buffers).toString('utf-8');
          try {
            body = raw ? JSON.parse(raw) : {};
          } catch {
            body = {};
          }
        }

        res.setHeader('Content-Type', 'application/json');

        try {
          if (req.url === '/api/status') {
            res.end(
              JSON.stringify({
                hasKey: Boolean(process.env.GEMINI_API_KEY),
              })
            );
            return;
          }

          if (req.url === '/api/tts') {
            const result = await generateSpeech(body);
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url === '/api/illustrate') {
            const result = await generateIllustration(body);
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url === '/api/chat') {
            const result = await chatWithCompanion(body);
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url === '/api/generate-story') {
            const result = await generateCustomStory(body);
            res.end(JSON.stringify(result));
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (err: any) {
          console.error('API Error in route', req.url, ':', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err?.message || 'Gemini API Error' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [apiPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
