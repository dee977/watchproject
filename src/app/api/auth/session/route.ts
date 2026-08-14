import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        addresses: {
          orderBy: { isDefaultShipping: 'desc' },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ user: null });
  }
}
