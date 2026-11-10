'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserPlus, Loader2 } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
    email: z.string().email('Введите корректный email адрес'),
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
  const [authError, setAuthError] = useState<string | null>(null);

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
          router.push('/planner');
        }, 500);
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
        router.push('/planner');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Произошла непредвиденная ошибка');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-text-primary">
          Регистрация
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Создайте аккаунт для синхронизации ваших привычек и задач
        </p>
      </div>

      {authError && (
        <div className="mb-4 p-3 rounded-lg bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-xs">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Ваше имя
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="Алексей"
            className="w-full px-3 py-2 rounded-lg border border-bg-card-alt bg-bg-primary text-xs text-text-primary outline-none focus:border-accent-blue transition-colors"
          />
          {errors.name && (
            <p className="text-[10px] text-accent-danger mt-1">{errors.name.message}</p>
          )}
        </div>

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

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Повторите пароль
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 rounded-lg border border-bg-card-alt bg-bg-primary text-xs text-text-primary outline-none focus:border-accent-blue transition-colors"
          />
          {errors.confirmPassword && (
            <p className="text-[10px] text-accent-danger mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-bg-header hover:bg-bg-header-dark text-text-on-dark font-medium text-xs transition-colors shadow-sm disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <UserPlus size={14} />
              Зарегистрироваться
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-text-secondary">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="font-semibold text-accent-blue hover:underline">
          Войти
        </Link>
      </div>
    </div>
  );
}
