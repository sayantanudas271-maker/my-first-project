import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[AutoOps Error]:', err);
  const status = typeof err.status === 'number' ? err.status : 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
  });
}
