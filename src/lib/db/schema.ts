import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, date, unique } from 'drizzle-orm/pg-core';

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  displayName: text('display_name'),
  theme: text('theme').default('dark').notNull(),
  language: text('language').default('ru').notNull(),
  localImportDoneAt: timestamp('local_import_done_at', { withTimezone: true }),
  soundEnabled: boolean('sound_enabled').default(true).notNull(),
  hapticsEnabled: boolean('haptics_enabled').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Habits table
export const habits = pgTable('habits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  icon: text('icon').default('🎯').notNull(),
  color: text('color').default('#00D4FF').notNull(),
  archived: boolean('archived').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Monthly Goals table
export const monthlyGoals = pgTable(
  'monthly_goals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    year: integer('year').notNull(),
    month: integer('month').notNull(),
    goalText: text('goal_text').default(''),
    habitTargets: jsonb('habit_targets').$type<Record<string, number>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserYearMonth: unique('monthly_goals_user_year_month_key').on(table.userId, table.year, table.month),
  })
);

// Habit Completions table
export const habitCompletions = pgTable(
  'habit_completions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    habitId: uuid('habit_id').references(() => habits.id, { onDelete: 'cascade' }).notNull(),
    completedDate: date('completed_date').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserHabitDate: unique('habit_completions_user_habit_date_key').on(table.userId, table.habitId, table.completedDate),
  })
);

// Tasks table
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  dayDate: date('day_date').notNull(),
  text: text('text').notNull(),
  completed: boolean('completed').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Daily Entries table (notes, improvements, gratitude)
export const dailyEntries = pgTable(
  'daily_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    dayDate: date('day_date').notNull(),
    notes: text('notes').array().default([]).notNull(),
    improvements: text('improvements').array().default([]).notNull(),
    gratitude: text('gratitude').array().default([]).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserDayDate: unique('daily_entries_user_day_date_key').on(table.userId, table.dayDate),
  })
);

// TypeScript types inferred from Drizzle schema
export type DrizzleProfile = typeof profiles.$inferSelect;
export type NewDrizzleProfile = typeof profiles.$inferInsert;
export type DrizzleHabit = typeof habits.$inferSelect;
export type NewDrizzleHabit = typeof habits.$inferInsert;
export type DrizzleMonthlyGoal = typeof monthlyGoals.$inferSelect;
export type NewDrizzleMonthlyGoal = typeof monthlyGoals.$inferInsert;
export type DrizzleHabitCompletion = typeof habitCompletions.$inferSelect;
export type NewDrizzleHabitCompletion = typeof habitCompletions.$inferInsert;
export type DrizzleTask = typeof tasks.$inferSelect;
export type NewDrizzleTask = typeof tasks.$inferInsert;
export type DrizzleDailyEntry = typeof dailyEntries.$inferSelect;
export type NewDrizzleDailyEntry = typeof dailyEntries.$inferInsert;
