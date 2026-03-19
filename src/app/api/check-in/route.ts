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
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Missing date param' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ checkIn: data });
  } catch (err) {
    console.error('check-in GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const date = body.date ?? new Date().toISOString().split('T')[0];

    // Get phase state for this date (should exist from daily-card fetch)
    const { data: phaseState } = await supabase
      .from('phase_states')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle();

    // Upsert check-in (one per user per day)
    const { data: checkIn, error } = await supabase
      .from('check_ins')
      .upsert(
        {
          user_id: user.id,
          date,
          phase_state_id: phaseState?.id ?? null,
          energy: body.energy,
          sleep_quality: body.sleep_quality,
          mood: body.mood,
          stress: body.stress,
          performance_feel: body.performance_feel,
          extended_symptoms: body.extended_symptoms ?? {},
          notes: body.notes ?? null,
        },
        { onConflict: 'user_id,date' },
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ checkIn });
  } catch (err) {
    console.error('check-in error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
