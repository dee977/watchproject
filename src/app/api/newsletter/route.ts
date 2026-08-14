import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({
        message: 'You are already enrolled in the AURELIA Horology Gazette.',
      });
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: cleanEmail,
        source: 'Website Footer Subscription',
      },
    });

    return NextResponse.json({
      message: 'Welcome to the AURELIA Horology Gazette.',
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 });
  }
}
