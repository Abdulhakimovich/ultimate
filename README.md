# ⚡ Ultimate — Трекер Привычек и Продуктивности

Полнофункциональное веб-приложение нового поколения для планирования недели, трекинга привычек и глубокой аналитики личной дисциплины.

Интерфейс переведён на три языка (**Русский**, **English**, **O'zbek**) и поддерживает тёмную и светлую темы с неоновым акцентом Electric Blue.

---

## 🔒 Требования к авторизации и безопасность данных

- **Обязательная авторизация:** Каждый пользователь обязан иметь учетную запись. Доступ к трекеру (`/tracker`), планеру (`/planner`) и аналитике (`/analytics`) закрыт для неавторизованных пользователей на уровне Next.js 16 Proxy и серверных компонентов.
- **Хранение данных в облаке:** Все привычки, отметки выполнения, месячные цели и таргеты, задачи, ежедневные заметки/улучшения/благодарности, а также профиль и настройки пользователя (тема, язык) сохраняются в базе данных Supabase под учетной записью пользователя.
- **Изоляция данных (RLS):** На всех таблицах включен Row Level Security (RLS). Пользователь имеет доступ исключительно к своим данным. Отметки выполнения привычек дополнительно валидируют принадлежность привычки текущему пользователю.

---

## 🛠 Стек технологий

- **Фреймворк:** Next.js 16 (App Router, Turbopack, Server & Client Components, Next.js Proxy)
- **Язык:** TypeScript (строгая типизация)
- **Стилизация:** Tailwind CSS v4 + кастомная CSS-система переменных (Electric Blue palette)
- **База данных и Auth:** Supabase PostgreSQL + Row Level Security (RLS) + @supabase/ssr
- **Управление состоянием:** Zustand (с оптимистичными обновлениями и откатом при ошибках)
- **Графики:** Recharts (AreaChart, BarChart) + кастомные SVG Donut-кольца
- **Анимации:** Framer Motion
- **Формы:** React Hook Form + Zod
- **Иконки:** Lucide React

---

## ⚙️ Настройка Supabase и запуск

### 1. Создание проекта Supabase
1. Зарегистрируйтесь или войдите в [Supabase](https://supabase.com).
2. Создайте новый проект и сохраните пароль базы данных.

### 2. Применение миграций базы данных
1. Откройте **SQL Editor** в панели управления вашим проектом Supabase.
2. Скопируйте и выполните содержимое файла `supabase/migrations/20261114210000_init.sql`.
   Миграция создаст таблицы `profiles`, `habits`, `monthly_goals`, `habit_completions`, `tasks`, `daily_entries`, настроит индексы, правила RLS и триггер создания профиля при регистрации.

### 3. Настройка провайдеров авторизации (Authentication)
1. В панели Supabase перейдите в **Authentication > Providers**:
   - **Email:** Убедитесь, что провайдер Email включен.
   - **Google:** Включите провайдер Google OAuth (укажите Client ID и Client Secret из Google Cloud Console).
2. В разделе **Authentication > URL Configuration**:
   - **Site URL:** Укажите `http://localhost:3000` (для локальной разработки) или URL вашего продакшена.
   - **Redirect URLs:** Добавьте следующие адреса:
     - `http://localhost:3000/auth/callback`
     - `https://your-production-domain.com/auth/callback`

### 4. Настройка переменных окружения
Создайте файл `.env.local` на основе `.env.example`:

```bash
cp .env.example .env.local
```

Заполните переменные:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Установка и запуск приложения

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Проверка линтером и сборка для продакшена
npm run lint
npm run build
npm start
```

После запуска приложение доступно по адресу: **http://localhost:3000**.
