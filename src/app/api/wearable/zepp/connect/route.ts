import { NextRequest, NextResponse } from 'next/server';
import { getZeppAuthUrl } from '@/lib/zepp';

export async function GET(request: NextRequest) {
  // Generate a state parameter for CSRF protection
  const state = crypto.randomUUID();

  // TODO: Store state in session/cookie for verification on callback

  const authUrl = getZeppAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
