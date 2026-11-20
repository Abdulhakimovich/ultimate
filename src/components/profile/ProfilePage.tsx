'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useProfileStore } from '@/store/profileStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import Skeleton from '@/components/ui/Skeleton';
import { getAllHabits } from '@/lib/data/habits';
import { getAllCompletions } from '@/lib/data/completions';
import { computeStreaks, computeThisMonthRate, type HabitStats } from '@/lib/stats';
import type { Habit, HabitCompletion } from '@/lib/types';

import ProfileHeader from './ProfileHeader';
import ProgressSection from './ProgressSection';
import PersonalInfoSection from './PersonalInfoSection';
import PreferencesSection from './PreferencesSection';
import SecuritySection from './SecuritySection';
import DataSection from './DataSection';
import DangerSection from './DangerSection';

export default function ProfilePage() {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  const profile = useProfileStore((s) => s.profile);
  const profileLoading = useProfileStore((s) => s.loading);
  const loadProfile = useProfileStore((s) => s.loadProfile);

  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [localHabits, setLocalHabits] = useState<Habit[]>([]);
  const [localCompletions, setLocalCompletions] = useState<HabitCompletion[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch auth user for email and provider identification
  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) setAuthUser(data.user);
      }).catch(() => {});
    } catch {}
  }, []);

  // Ensure profile is loaded if user navigated directly to /profile
  useEffect(() => {
    if (!profile && !profileLoading) {
      loadProfile();
    }
  }, [profile, profileLoading, loadProfile]);

  // Load habits and all completions for stats
  useEffect(() => {
    let isMounted = true;
    async function loadStatsData() {
      setDataLoading(true);
      try {
        const [h, c] = await Promise.all([
          getAllHabits(),
          getAllCompletions(),
        ]);
        if (!isMounted) return;
        setLocalHabits(h);
        setLocalCompletions(c);
      } catch (err) {
        console.error('Failed to load profile stats data:', err);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    }

    loadStatsData();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats: HabitStats = useMemo(() => {
    const active = localHabits.filter((h) => !h.archived);
    const streaks = computeStreaks(localCompletions);
    const rate = computeThisMonthRate(localCompletions, active.length);
    return {
      activeHabits: active.length,
      totalCompletions: localCompletions.length,
      currentStreak: streaks.currentStreak,
      bestStreak: streaks.bestStreak,
      completionRate: rate,
    };
  }, [localHabits, localCompletions]);

  // Loading skeleton state
  if (profileLoading) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-3 space-y-4">
        <div className="surface-card rounded-2xl p-5 border-hairline flex items-center gap-4">
          <Skeleton width="64px" height="64px" rounded="rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton width="40%" height="20px" />
            <Skeleton width="60%" height="14px" />
          </div>
        </div>
        <ProgressSection stats={null} loading={true} />
        <div className="surface-card rounded-2xl p-5 border-hairline space-y-3">
          <Skeleton width="30%" height="16px" />
          <Skeleton width="100%" height="40px" />
        </div>
      </div>
    );
  }

  // Error card with retry button if profile failed to load
  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="surface-card rounded-2xl p-6 border-hairline space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(239,68,68,0.12)] text-[var(--accent-red)] flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2 className="font-display font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              {tr.profile.profileLoadError}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {tr.auth.loginSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadProfile()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
            style={{
              background: 'linear-gradient(135deg, var(--electric), var(--blue-neon))',
              color: '#000',
            }}
          >
            <RefreshCw size={13} />
            <span>{tr.profile.retryLoad}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 px-2 sm:px-3 space-y-4 pb-16">
      {/* 1. Header */}
      <ProfileHeader profile={profile} email={authUser?.email || null} />

      {/* 2. Your Progress */}
      <ProgressSection stats={stats} loading={dataLoading} />

      {/* 3. Personal Info */}
      <PersonalInfoSection />

      {/* 4. Preferences */}
      <PreferencesSection />

      {/* 5. Security (hidden if Google-only) */}
      <SecuritySection user={authUser} />

      {/* 6. Your Data */}
      <DataSection />

      {/* 7. Danger Zone */}
      <DangerSection email={authUser?.email || null} />
    </div>
  );
}
