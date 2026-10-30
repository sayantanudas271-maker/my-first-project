import { Response } from 'express';
import { aiAgentService } from '../services/aiAgentService.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const mediaController = {
  generateImage: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { prompt, aspectRatio } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    try {
      const result = await aiAgentService.generateOrEditImage(
        prompt,
        undefined,
        undefined,
        aspectRatio || '1:1'
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Image generation failed' });
    }
  },

  editImage: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { prompt, inputImage, mimeType, aspectRatio } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }
    if (!inputImage || typeof inputImage !== 'string') {
      res.status(400).json({ error: 'Base64 inputImage is required for editing' });
      return;
    }

    try {
      const result = await aiAgentService.generateOrEditImage(
        prompt,
        inputImage,
        mimeType || 'image/png',
        aspectRatio || '1:1'
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Image editing failed' });
    }
  },

  animateVideo: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { image, mimeType, motionPrompt, aspectRatio } = req.body;
    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: 'Base64 image is required for video animation' });
      return;
    }

    const ratio: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';

    try {
      const result = await aiAgentService.animateImageToVideo(
        image,
        mimeType || 'image/png',
        motionPrompt || 'Smooth cinematic pan of industrial warehouse facility and autonomous robotic units',
        ratio
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Video animation failed' });
    }
  },
};
