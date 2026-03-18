/**
 * Zepp / Amazfit API Integration
 *
 * V1 wearable integration for Wild.AI.
 * Uses Zepp's OAuth2 REST API to pull:
 * - HRV, resting HR, sleep stages, steps, workouts, temperature
 *
 * Zepp API docs: https://github.com/nicognaW/zepp-open-api
 * OAuth flow: Authorization Code Grant
 */

import type { WearableSnapshot, WearableProvider } from '@/types';

// --- Configuration ---

const ZEPP_API_BASE = 'https://api.zepp.com';
const ZEPP_AUTH_URL = 'https://auth.zepp.com/oauth2/authorize';
const ZEPP_TOKEN_URL = 'https://auth.zepp.com/oauth2/token';

interface ZeppConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

function getConfig(): ZeppConfig {
  return {
    clientId: process.env.ZEPP_CLIENT_ID || '',
    clientSecret: process.env.ZEPP_CLIENT_SECRET || '',
    redirectUri: process.env.ZEPP_REDIRECT_URI || '',
  };
}

// --- OAuth2 Flow ---

export function getZeppAuthUrl(state: string): string {
  const config = getConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'data:read',
    state,
  });
  return `${ZEPP_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const config = getConfig();
  const response = await fetch(ZEPP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Zepp token exchange failed: ${response.status}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const config = getConfig();
  const response = await fetch(ZEPP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Zepp token refresh failed: ${response.status}`);
  }

  return response.json();
}

// --- Data Fetching ---

async function zeppFetch(endpoint: string, accessToken: string) {
  const response = await fetch(`${ZEPP_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Zepp API error: ${response.status} on ${endpoint}`);
  }

  return response.json();
}

interface ZeppSleepData {
  sleep_score?: number;
  total_sleep_minutes?: number;
  deep_sleep_minutes?: number;
  light_sleep_minutes?: number;
  rem_sleep_minutes?: number;
  awake_minutes?: number;
}

interface ZeppActivityData {
  steps?: number;
  calories?: number;
  distance_meters?: number;
  active_minutes?: number;
}

interface ZeppHealthData {
  hrv?: number;
  resting_hr?: number;
  spo2?: number;
  stress_score?: number;
  skin_temperature?: number;
}

export async function fetchSleepData(
  accessToken: string,
  date: string
): Promise<ZeppSleepData> {
  try {
    const data = await zeppFetch(`/v2/users/-/sleep?date=${date}`, accessToken);
    return {
      sleep_score: data.sleep_score,
      total_sleep_minutes: data.total_sleep_minutes,
      deep_sleep_minutes: data.deep_sleep_minutes,
      light_sleep_minutes: data.light_sleep_minutes,
      rem_sleep_minutes: data.rem_sleep_minutes,
      awake_minutes: data.awake_minutes,
    };
  } catch {
    return {};
  }
}

export async function fetchActivityData(
  accessToken: string,
  date: string
): Promise<ZeppActivityData> {
  try {
    const data = await zeppFetch(`/v2/users/-/activity?date=${date}`, accessToken);
    return {
      steps: data.steps,
      calories: data.calories,
      distance_meters: data.distance_meters,
      active_minutes: data.active_minutes,
    };
  } catch {
    return {};
  }
}

export async function fetchHealthMetrics(
  accessToken: string,
  date: string
): Promise<ZeppHealthData> {
  try {
    const data = await zeppFetch(`/v2/users/-/health?date=${date}`, accessToken);
    return {
      hrv: data.hrv,
      resting_hr: data.resting_hr,
      spo2: data.spo2,
      stress_score: data.stress_score,
      skin_temperature: data.skin_temperature,
    };
  } catch {
    return {};
  }
}

// --- Composite Snapshot ---

export async function fetchDailySnapshot(
  accessToken: string,
  userId: string,
  date: string
): Promise<Omit<WearableSnapshot, 'id' | 'created_at'>> {
  const [sleep, activity, health] = await Promise.all([
    fetchSleepData(accessToken, date),
    fetchActivityData(accessToken, date),
    fetchHealthMetrics(accessToken, date),
  ]);

  return {
    user_id: userId,
    date,
    provider: 'zepp' as WearableProvider,
    hrv: health.hrv ?? null,
    resting_hr: health.resting_hr ?? null,
    sleep_score: sleep.sleep_score ?? null,
    sleep_duration_mins: sleep.total_sleep_minutes ?? null,
    steps: activity.steps ?? null,
    raw_payload: { sleep, activity, health },
  };
}

// --- Connection Health ---

export async function checkConnectionHealth(
  accessToken: string
): Promise<{ healthy: boolean; error?: string }> {
  try {
    await zeppFetch('/v2/users/-/profile', accessToken);
    return { healthy: true };
  } catch (err) {
    return {
      healthy: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
