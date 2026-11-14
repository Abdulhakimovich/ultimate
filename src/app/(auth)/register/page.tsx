'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, Loader2, Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
    email: z.string().email('Некорректный email адрес'),
    password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
    confirmPassword: z.string().min(6, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextTarget = searchParams.get('next') || '/tracker';

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCheckEmail, setIsCheckEmail] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [mounted, setMounted] = useState(false);

  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextTarget)}`;
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: callbackUrl,
          data: {
            full_name: data.name,
            display_name: data.name,
            name: data.name,
          },
        },
      });

      if (error) {
        setAuthError(error.message || 'Ошибка регистрации');
        setIsLoading(false);
      } else if (authData.user && !authData.session) {
        // Email confirmation is required by Supabase project settings
        setRegisteredEmail(data.email);
        setIsCheckEmail(true);
        setIsLoading(false);
      } else {
        router.push(nextTarget);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Произошла непредвиденная ошибка';
      setAuthError(message);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextTarget)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      });
      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка входа через Google';
      setAuthError(message);
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return <div className="h-80 rounded-2xl skeleton-shimmer" />;
  }

  if (isCheckEmail) {
    return (
      <div className="space-y-4 text-center py-4">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-[var(--electric-glow)] border border-[var(--border-bright)]">
          <CheckCircle2 size={32} style={{ color: 'var(--electric)' }} />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {language === 'ru' ? 'Подтвердите ваш email' : language === 'uz' ? 'Emailingizni tasdiqlang' : 'Confirm your email'}
          </h2>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
            {language === 'ru'
              ? `Мы отправили ссылку для подтверждения на адрес ${registeredEmail}. Пожалуйста, перейдите по ссылке для завершения регистрации.`
              : language === 'uz'
              ? `Biz ${registeredEmail} manziliga tasdiqlash xatini yubordik. Ro'yxatdan o'tishni yakunlash uchun havolaga o'ting.`
              : `We sent a confirmation link to ${registeredEmail}. Please check your inbox and click the link to continue.`}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold border-hairline hover:bg-[var(--bg-elevated)]"
            style={{ color: 'var(--electric)' }}
          >
            {language === 'ru' ? 'Перейти ко входу' : language === 'uz' ? 'Kirish sahifasiga' : 'Back to login'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {tr.auth.registerTitle}
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          {tr.auth.registerSubtitle}
        </p>
      </div>

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

      {/* Google OAuth Login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border-hairline hover:bg-[var(--bg-elevated)] active:scale-[0.99] disabled:opacity-50"
        style={{
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
        }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
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
        <span>{tr.auth.googleBtn}</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
          {tr.auth.orEmail}
        </span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {tr.auth.nameLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              <User size={15} />
            </div>
            <input
              {...register('name')}
              type="text"
              placeholder={tr.auth.namePlaceholder}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition-all border-hairline"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--electric)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          {errors.name && (
            <p className="text-[10px] mt-1 text-[var(--accent-red)] font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {tr.auth.emailLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              <Mail size={15} />
            </div>
            <input
              {...register('email')}
              type="email"
              placeholder={tr.auth.emailPlaceholder}
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

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {tr.auth.passwordLabel}
          </label>
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

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {tr.auth.confirmPasswordLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              <Lock size={15} />
            </div>
            <input
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder={tr.auth.passwordPlaceholder}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none transition-all border-hairline font-mono"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--electric)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-[10px] mt-1 text-[var(--accent-red)] font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-[#07090E] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:opacity-50 mt-2"
          style={{
            background: 'linear-gradient(135deg, var(--electric), var(--blue-neon))',
            boxShadow: '0 4px 16px var(--electric-glow)',
          }}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <UserPlus size={15} />
              <span>{tr.auth.registerBtn}</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-3 pt-3 border-t border-[var(--border)] text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>{tr.auth.alreadyHaveAccount} </span>
        <Link
          href={`/login${nextTarget !== '/tracker' ? `?next=${encodeURIComponent(nextTarget)}` : ''}`}
          className="font-bold hover:underline transition-colors ml-1"
          style={{ color: 'var(--electric)' }}
        >
          {tr.auth.loginBtn}
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-80 rounded-2xl skeleton-shimmer" />}>
      <RegisterForm />
    </Suspense>
  );
}
