import { NextRequest, NextResponse } from 'next/server';
import { fetchDailySnapshot, checkConnectionHealth } from '@/lib/zepp';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const { userId, accessToken } = await request.json();

    if (!userId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing userId or accessToken' },
        { status: 400 }
      );
    }

    // Check connection health first
    const health = await checkConnectionHealth(accessToken);
    if (!health.healthy) {
      return NextResponse.json(
        { error: 'Zepp connection unhealthy', details: health.error },
        { status: 502 }
      );
    }

    // Fetch today's snapshot
    const today = format(new Date(), 'yyyy-MM-dd');
    const snapshot = await fetchDailySnapshot(accessToken, userId, today);

    // TODO: Save snapshot to wearable_snapshots table via Supabase
    // TODO: Update wearable_connections.last_sync_at
    // TODO: Use snapshot data to enhance readiness score via phase engine

    return NextResponse.json({
      success: true,
      snapshot,
      synced_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Zepp sync error:', err);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
