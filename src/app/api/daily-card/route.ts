import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { computePhase } from '@/engine/phase-engine';
import type { PhaseInput, CheckIn, PhaseState, WearableSnapshot } from '@/types';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Parallel fetch: user profile, recent check-ins, cycle log, wearable snapshot, phase history
    const [profileRes, checkInsRes, cycleRes, snapshotRes, historyRes] =
      await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
          .order('date', { ascending: false })
          .limit(7),
        supabase
          .from('cycle_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('period_start_date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('wearable_snapshots')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('phase_states')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30),
      ]);

    const profile = profileRes.data;
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Determine cycle day from cycle log
    let cycleDay: number | null = null;
    if (cycleRes.data) {
      const startDate = new Date(cycleRes.data.period_start_date);
      const todayDate = new Date(today);
      const daysSinceStart = Math.floor(
        (todayDate.getTime() - startDate.getTime()) / 86400000,
      );
      const cycleLength = cycleRes.data.cycle_length_days || 28;
      cycleDay = (daysSinceStart % cycleLength) + 1;
    }

    const input: PhaseInput = {
      life_stage: profile.life_stage,
      cycle_day: cycleDay,
      cycle_length_avg: cycleRes.data?.cycle_length_days ?? 28,
      recent_check_ins: (checkInsRes.data ?? []) as CheckIn[],
      wearable_snapshot: (snapshotRes.data as WearableSnapshot) ?? null,
      historical_phases: (historyRes.data ?? []) as PhaseState[],
      algorithm_version: '0.1.0',
    };

    const phaseOutput = computePhase(input);

    // Upsert today's phase state
    await supabase.from('phase_states').upsert(
      {
        user_id: user.id,
        date: today,
        phase_name: phaseOutput.phase_name,
        biome_label: phaseOutput.biome_label,
        cycle_day: phaseOutput.cycle_day,
        confidence_score: phaseOutput.confidence_score,
        life_stage: profile.life_stage,
        algorithm_version: phaseOutput.algorithm_version,
        readiness_score: phaseOutput.readiness_score,
      },
      { onConflict: 'user_id,date' },
    );

    // Fetch recommendation content from DB for the current phase + life stage
    const { data: recContent } = await supabase
      .from('recommendations_content')
      .select('*')
      .eq('phase', phaseOutput.phase_name)
      .eq('life_stage', profile.life_stage)
      .eq('status', 'approved')
      .eq('algorithm_version', '0.1.0');

    // Merge DB recommendations if available, otherwise use engine defaults
    let recommendations = phaseOutput.recommendations;
    if (recContent && recContent.length > 0) {
      const byType: Record<string, typeof recContent[0]> = {};
      recContent.forEach((r) => {
        byType[r.type] = r;
      });
      recommendations = {
        training: byType.training
          ? { title: byType.training.content.title, summary: byType.training.content.summary, details: byType.training.content.guidelines?.join('\n') ?? '', tips: byType.training.content.guidelines ?? [] }
          : phaseOutput.recommendations.training,
        nutrition: byType.nutrition
          ? { title: byType.nutrition.content.title, summary: byType.nutrition.content.summary, details: byType.nutrition.content.guidelines?.join('\n') ?? '', tips: byType.nutrition.content.guidelines ?? [] }
          : phaseOutput.recommendations.nutrition,
        recovery: byType.recovery
          ? { title: byType.recovery.content.title, summary: byType.recovery.content.summary, details: byType.recovery.content.guidelines?.join('\n') ?? '', tips: byType.recovery.content.guidelines ?? [] }
          : phaseOutput.recommendations.recovery,
      };
    }

    // Check if user has checked in today
    const todayCheckIn = (checkInsRes.data ?? []).find(
      (c: CheckIn) => c.date === today,
    );

    return NextResponse.json({
      phase: {
        phase_name: phaseOutput.phase_name,
        biome_label: phaseOutput.biome_label,
        cycle_day: phaseOutput.cycle_day,
        confidence_score: phaseOutput.confidence_score,
        readiness_score: phaseOutput.readiness_score,
        algorithm_version: phaseOutput.algorithm_version,
      },
      recommendations,
      todayCheckIn: todayCheckIn ?? null,
      profile: {
        life_stage: profile.life_stage,
        avatar_name: profile.avatar_name,
        sport_type: profile.sport_type,
        goal: profile.goal,
      },
    });
  } catch (err) {
    console.error('daily-card error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
