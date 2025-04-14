import { seedAdmin } from '@/lib/db/seedAdmin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await seedAdmin();
    return NextResponse.json({ message: 'Admin seeded successfully' });
  } catch (error) {
    console.error('Error seeding admin:', error);
    return NextResponse.json({ error: 'Failed to seed admin' }, { status: 500 });
  }
}