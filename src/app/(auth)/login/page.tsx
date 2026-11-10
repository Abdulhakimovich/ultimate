'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { LogIn, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email адрес'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      if (!isSupabaseConfigured) {
        // Fallback for local demo mode
        setTimeout(() => {
          router.push('/planner');
        }, 500);
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
        router.push('/planner');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Произошла непредвиденная ошибка');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        router.push('/planner');
        return;
      }
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/planner`,
        },
      });
    } catch {
      router.push('/planner');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-text-primary">
          Вход в аккаунт
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Введите ваш email и пароль для продолжения
        </p>
      </div>

      {authError && (
        <div className="mb-4 p-3 rounded-lg bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-xs">
          {authError}
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-bg-header/40 bg-bg-primary hover:bg-bg-card-alt text-xs font-medium text-text-primary transition-colors shadow-sm mb-4 disabled:opacity-50"
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
        Войти через Google
      </button>

      <div className="relative my-4 flex items-center justify-center">
        <div className="border-t border-bg-card-alt w-full" />
        <span className="bg-bg-card px-2 text-[10px] text-text-muted uppercase">или</span>
        <div className="border-t border-bg-card-alt w-full" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="name@example.com"
            className="w-full px-3 py-2 rounded-lg border border-bg-card-alt bg-bg-primary text-xs text-text-primary outline-none focus:border-accent-blue transition-colors"
          />
          {errors.email && (
            <p className="text-[10px] text-accent-danger mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Пароль
          </label>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 rounded-lg border border-bg-card-alt bg-bg-primary text-xs text-text-primary outline-none focus:border-accent-blue transition-colors"
          />
          {errors.password && (
            <p className="text-[10px] text-accent-danger mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-bg-header hover:bg-bg-header-dark text-text-on-dark font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <LogIn size={14} />
              Войти
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-text-secondary">
        Нет аккаунта?{' '}
        <Link href="/register" className="font-semibold text-accent-blue hover:underline">
          Зарегистрироваться
        </Link>
      </div>
    </div>
  );
}
