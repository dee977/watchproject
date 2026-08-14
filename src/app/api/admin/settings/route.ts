import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, canManageSettings } from '@/lib/auth';
import { getStoreSettings } from '@/lib/store-settings';

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !canManageSettings(session.role)) {
      return NextResponse.json({ error: 'Unauthorized. Super Admin or Admin role required.' }, { status: 403 });
    }

    const body = await req.json();

    // Iterate through key-value pairs and update database
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' || typeof value === 'number') {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }

    await prisma.adminActivityLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE_SETTINGS',
        entityType: 'SETTINGS',
        details: 'Updated store configuration parameters',
      },
    });

    const updatedSettings = await getStoreSettings();
    return NextResponse.json({
      message: 'Store settings updated successfully.',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
