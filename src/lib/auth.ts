import { cache as reactCache } from 'react';
const cache = typeof reactCache === 'function' ? reactCache : (<T extends (...args: any[]) => any>(fn: T): T => fn);
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { Role } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'aurelia_secret_jwt_fallback_key_2026';
const COOKIE_NAME = 'aurelia_auth_token';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export const getSessionUser = cache(async (req?: Request | any): Promise<TokenPayload | null> => {
  try {
    let token: string | undefined | null;

    if (req && typeof req.headers?.get === 'function') {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
      if (match) {
        token = match[1];
      }
      if (!token) {
        const authHeader = req.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
    }

    if (!token) {
      try {
        const cookieStore = cookies();
        token = cookieStore.get(COOKIE_NAME)?.value;
      } catch (e) {
        // cookies() not available outside RSC context
      }
    }

    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    // Verify user still exists in database if DB is reachable
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, name: true },
      });

      if (user) {
        return {
          userId: user.id,
          email: user.email,
          role: user.role as Role,
          name: user.name,
        };
      }
    } catch (dbError) {
      // In offline/test environments or transient pooler retries, trust cryptographically verified signed JWT token
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role as Role,
        name: decoded.name,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
});

export function hasAdminAccess(role?: Role | string | null): boolean {
  if (!role) return false;
  return (
    role === 'SUPER_ADMIN' ||
    role === 'ADMIN' ||
    role === 'MANAGER' ||
    role === 'CUSTOMER_SUPPORT'
  );
}

export function canManageProducts(role?: Role | string | null): boolean {
  if (!role) return false;
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MANAGER';
}

export function canManageOrders(role?: Role | string | null): boolean {
  if (!role) return false;
  return (
    role === 'SUPER_ADMIN' ||
    role === 'ADMIN' ||
    role === 'MANAGER' ||
    role === 'CUSTOMER_SUPPORT'
  );
}

export function canManageSettings(role?: Role | string | null): boolean {
  if (!role) return false;
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export { COOKIE_NAME };
