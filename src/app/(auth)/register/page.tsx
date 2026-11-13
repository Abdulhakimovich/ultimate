'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserPlus, Loader2, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
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

export default function RegisterPage() {
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
      if (!isSupabaseConfigured) {
        setTimeout(() => {
          router.push('/tracker');
        }, 400);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });

      if (error) {
        setAuthError(error.message || 'Ошибка регистрации');
        setIsLoading(false);
      } else {
        router.push('/tracker');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Произошла непредвиденная ошибка');
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return <div className="h-80 rounded-2xl skeleton-shimmer" />;
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
            Ваше имя
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              <User size={15} />
            </div>
            <input
              {...register('name')}
              type="text"
              placeholder="Алекс"
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

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
            {tr.auth.password}
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
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] mt-1 text-[var(--accent-red)] font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
            Подтвердите пароль
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              <Lock size={15} />
            </div>
            <input
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
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
            <p className="text-[10px] mt-1 text-[var(--accent-red)] font-medium">{errors.confirmPassword.message}</p>
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
      <div className="mt-4 pt-3 border-t border-[var(--border)] text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>{tr.auth.hasAccount} </span>
        <Link
          href="/login"
          className="font-bold hover:underline transition-colors ml-1"
          style={{ color: 'var(--electric)' }}
        >
          {tr.auth.login}
        </Link>
      </div>
    </div>
  );
}
