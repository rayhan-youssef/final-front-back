import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing authorization token' });
    return;
  }

  const token = header.substring('Bearer '.length);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(503).json({ message: 'Server misconfiguration: JWT_SECRET is not set' });
    return;
  }
  try {
    const payload = jwt.verify(token, secret) as { userId: string; email: string };
    req.user = { id: payload.userId, email: payload.email };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

