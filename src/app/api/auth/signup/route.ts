import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { email, password, profile } = await req.json();

    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const authUser = data.user;
    if (!authUser) {
      return NextResponse.json({ error: 'Signup succeeded but no user returned' }, { status: 500 });
    }

    // 2. Create user profile row in the users table
    if (profile) {
      const { error: profileError } = await supabase.from('users').insert({
        id: authUser.id,
        email: authUser.email,
        life_stage: profile.life_stage ?? 'menstrual_cycle',
        avatar_name: profile.avatar_name ?? '',
        sport_type: profile.sport_type ?? 'General Fitness',
        experience_level: profile.experience_level ?? 'recreational',
        timezone: profile.timezone ?? 'UTC',
        region: profile.region ?? '',
        goal: profile.goal ?? 'balance',
        onboarding_complete: true,
        consent_version: profile.consent_version ?? '1.0',
        consent_granted_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error('profile insert error:', profileError);
        // Auth user was created but profile failed — return partial success
        return NextResponse.json(
          { user: authUser, warning: 'Account created but profile setup failed. Please try again.' },
          { status: 207 },
        );
      }

      // 3. Record consent entries
      const consentRecords = [];
      if (profile.health_consent) {
        consentRecords.push({ user_id: authUser.id, consent_type: 'health_processing', granted: true, version: '1.0' });
      }
      if (profile.analytics_consent) {
        consentRecords.push({ user_id: authUser.id, consent_type: 'analytics', granted: true, version: '1.0' });
      }
      if (profile.marketing_consent) {
        consentRecords.push({ user_id: authUser.id, consent_type: 'marketing', granted: true, version: '1.0' });
      }
      if (consentRecords.length > 0) {
        await supabase.from('consent_records').insert(consentRecords);
      }

      // 4. Create initial cycle log if menstrual_cycle user provided period data
      if (profile.life_stage === 'menstrual_cycle' && profile.last_period_start) {
        await supabase.from('cycle_logs').insert({
          user_id: authUser.id,
          period_start_date: profile.last_period_start,
          cycle_length_days: profile.cycle_length ?? 28,
          is_confirmed: true,
          source: 'manual',
        });
      }
    }

    // Return the full profile for the client store
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    return NextResponse.json({ user: userProfile ?? authUser });
  } catch (err) {
    console.error('signup error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
