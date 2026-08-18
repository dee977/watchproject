import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { z } from 'zod';
import { Role } from '@/types';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@aurelia.com').toLowerCase().trim();
    const defaultAdminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const defaultCustomerEmail = (process.env.DEMO_CUSTOMER_EMAIL || 'vikram@royalhorology.com').toLowerCase().trim();
    const defaultCustomerPass = process.env.DEMO_CUSTOMER_PASSWORD || 'Collector@123';

    // 1. Auto-provision or update default Super Admin if needed
    if (normalizedEmail === defaultAdminEmail && password === defaultAdminPass) {
      if (!user) {
        const passwordHash = await hashPassword(defaultAdminPass);
        user = await prisma.user.create({
          data: {
            email: defaultAdminEmail,
            passwordHash,
            name: process.env.ADMIN_NAME || 'Alexander Vance',
            role: 'SUPER_ADMIN',
            emailVerified: true,
          },
        });
      } else {
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid || user.role !== 'SUPER_ADMIN') {
          const passwordHash = await hashPassword(defaultAdminPass);
          user = await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash, role: 'SUPER_ADMIN' },
          });
        }
      }
    }

    // 2. Auto-provision or update demo VIP Customer if needed
    if (normalizedEmail === defaultCustomerEmail && password === defaultCustomerPass) {
      if (!user) {
        const passwordHash = await hashPassword(defaultCustomerPass);
        user = await prisma.user.create({
          data: {
            email: defaultCustomerEmail,
            passwordHash,
            name: process.env.DEMO_CUSTOMER_NAME || 'Vikramaditya Roy',
            role: 'CUSTOMER',
            emailVerified: true,
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please verify your email and password.' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please verify your email and password.' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
    });

    const response = NextResponse.json({
      message: 'Authentication successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred during authentication.' },
      { status: 500 }
    );
  }
}
