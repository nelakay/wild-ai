import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/zepp';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?zepp_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?zepp_error=no_code', request.url)
    );
  }

  // TODO: Verify state parameter against stored session value

  try {
    const tokens = await exchangeCodeForTokens(code);

    // TODO: Encrypt tokens and store in wearable_connections table via Supabase
    // TODO: Create/update wearable_connections row with status='active'
    // TODO: Trigger initial data sync

    return NextResponse.redirect(
      new URL('/settings?zepp_connected=true', request.url)
    );
  } catch (err) {
    console.error('Zepp OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/settings?zepp_error=token_exchange_failed', request.url)
    );
  }
}
