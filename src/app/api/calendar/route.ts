import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json({ error: 'Missing from/to params' }, { status: 400 });
    }

    // Parallel fetch: check-ins, workouts, phase states, cycle log, user profile
    const [checkInsRes, workoutsRes, phaseStatesRes, cycleRes, profileRes] =
      await Promise.all([
        supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', from)
          .lte('date', to)
          .order('date'),
        supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', from)
          .lte('date', to)
          .order('date'),
        supabase
          .from('phase_states')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', from)
          .lte('date', to)
          .order('date'),
        supabase
          .from('cycle_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('period_start_date', { ascending: false })
          .limit(3),
        supabase
          .from('users')
          .select('life_stage')
          .eq('id', user.id)
          .single(),
      ]);

    return NextResponse.json({
      checkIns: checkInsRes.data ?? [],
      workouts: workoutsRes.data ?? [],
      phaseStates: phaseStatesRes.data ?? [],
      cycleLogs: cycleRes.data ?? [],
      lifeStage: profileRes.data?.life_stage ?? 'menstrual_cycle',
    });
  } catch (err) {
    console.error('calendar GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
