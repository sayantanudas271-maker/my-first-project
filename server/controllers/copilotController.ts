import { Response } from 'express';
import { aiAgentService } from '../services/aiAgentService.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const copilotController = {
  chat: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { messages, persona } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    try {
      const result = await aiAgentService.chatWithAgent(messages, persona);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Chat processing failed' });
    }
  },

  searchMarket: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query string is required' });
      return;
    }

    try {
      const result = await aiAgentService.searchMarketIntelligence(query);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Market search failed' });
    }
  },

  searchMaps: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { query, latitude, longitude } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Location query string is required' });
      return;
    }

    try {
      const result = await aiAgentService.searchMapsGrounding(query, latitude, longitude);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Maps grounding failed' });
    }
  },

  transcribeAudio: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { audioData, mimeType } = req.body;
    if (!audioData || typeof audioData !== 'string') {
      res.status(400).json({ error: 'Base64 audioData string is required' });
      return;
    }

    try {
      const result = await aiAgentService.transcribeAudio(audioData, mimeType);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Audio transcription failed' });
    }
  },
};
