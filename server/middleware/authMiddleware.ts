import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../models/store.ts';
import { User, UserRole } from '../models/types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'autoops-enterprise-jwt-secret-2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
    const user = db.findUserById(decoded.id);
    if (!user) {
      res.status(401).json({ error: 'User no longer exists or session is invalid.' });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
