'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { LogIn, Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, Check } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';

const loginSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      if (!isSupabaseConfigured) {
        // Fallback for local demo mode: instant transition
        setTimeout(() => {
          router.push('/tracker');
        }, 400);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setAuthError(error.message || 'Ошибка входа. Проверьте данные.');
        setIsLoading(false);
      } else {
        router.push('/tracker');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Произошла непредвиденная ошибка');
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setValue('email', 'demo@ultimate.app');
    setValue('password', 'discipline2026');
    setIsLoading(true);
    setAuthError(null);
    setTimeout(() => {
      router.push('/tracker');
    }, 350);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        router.push('/tracker');
        return;
      }
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/tracker`,
        },
      });
    } catch {
      router.push('/tracker');
    }
  };

  if (!mounted) {
    return <div className="h-80 rounded-2xl skeleton-shimmer" />;
  }

  return (
    <div className="space-y-5">
      {/* Title & Subtitle */}
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {tr.auth.loginTitle}
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          {tr.auth.loginSubtitle}
        </p>
      </div>

      {/* Error alert */}
      {authError && (
        <div
          className="p-3 rounded-xl flex items-start gap-2.5 text-xs animate-shake"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: 'var(--accent-red)',
          }}
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{authError}</span>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border-hairline transition-all hover:bg-[var(--bg-elevated)] text-xs font-semibold shadow-sm disabled:opacity-50"
        style={{
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
        }}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{tr.auth.googleLogin}</span>
      </button>

      {/* Divider */}
      <div className="relative my-3 flex items-center justify-center">
        <div className="border-t border-[var(--border)] w-full" />
        <span
          className="px-2 text-[10px] font-mono uppercase bg-[var(--bg-card)] whitespace-nowrap"
          style={{ color: 'var(--text-muted)' }}
        >
          {tr.auth.orContinueWith}
        </span>
        <div className="border-t border-[var(--border)] w-full" />
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email field */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
            {tr.auth.email}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              <Mail size={15} />
            </div>
            <input
              {...register('email')}
              type="email"
              placeholder="alex@example.com"
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition-all border-hairline font-mono"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--electric)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          {errors.email && (
            <p className="text-[10px] mt-1 text-[var(--accent-red)] font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {tr.auth.password}
            </label>
            <span
              className="text-[11px] cursor-pointer hover:underline"
              style={{ color: 'var(--electric)' }}
              onClick={() => alert(tr.auth.forgotPassword + ' — В демо-режиме используйте быстрый вход ниже.')}
            >
              {tr.auth.forgotPassword}
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              <Lock size={15} />
            </div>
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={tr.auth.passwordPlaceholder}
              className="w-full pl-9 pr-10 py-2 rounded-xl text-xs outline-none transition-all border-hairline font-mono"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--electric)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] mt-1 text-[var(--accent-red)] font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs" style={{ color: 'var(--text-secondary)' }}>
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="w-4 h-4 rounded text-[var(--electric)] accent-[var(--electric)] cursor-pointer"
            />
            <span>{tr.auth.rememberMe}</span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-[#07090E] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, var(--electric), var(--blue-neon))',
            boxShadow: '0 4px 16px var(--electric-glow)',
          }}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <LogIn size={15} />
              <span>{tr.auth.loginBtn}</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Login Option */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border-hairline hover:bg-[var(--bg-elevated)]"
          style={{
            color: 'var(--electric)',
            borderColor: 'var(--border-bright)',
            background: 'var(--electric-glow)',
          }}
        >
          <Sparkles size={14} />
          <span>{tr.auth.quickDemoLogin}</span>
        </button>
      </div>

      {/* Switch to Register */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>{tr.auth.noAccount} </span>
        <Link
          href="/register"
          className="font-bold hover:underline transition-colors ml-1"
          style={{ color: 'var(--electric)' }}
        >
          {tr.auth.registerBtn}
        </Link>
      </div>
    </div>
  );
}
