import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../models/store.ts';
import { generateToken, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { User } from '../models/types.ts';

export const authController = {
  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const user = db.findUserByEmail(email);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  },

  register: async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;

    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      passwordHash,
      role: role || 'AGENT_OPERATOR',
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  },

  me: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  },
};
