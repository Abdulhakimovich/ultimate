import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, date, unique } from 'drizzle-orm/pg-core';

// Habits table
export const habits = pgTable('habits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archived: boolean('archived').default(false).notNull(),
});

// Monthly Goals table
export const monthlyGoals = pgTable('monthly_goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  goalText: text('goal_text'),
  habitTargets: jsonb('habit_targets').$type<Record<string, number>>(),
});

// Habit Completions table
export const habitCompletions = pgTable(
  'habit_completions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    habitId: uuid('habit_id').references(() => habits.id, { onDelete: 'cascade' }).notNull(),
    completedDate: date('completed_date').notNull(),
  },
  (table) => ({
    uniqueUserHabitDate: unique('user_habit_date_unique').on(table.userId, table.habitId, table.completedDate),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Daily Entries table (notes, improvements, gratitude)
export const dailyEntries = pgTable(
  'daily_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    dayDate: date('day_date').notNull(),
    notes: text('notes').array(),
    improvements: text('improvements').array(),
    gratitude: text('gratitude').array(),
  },
  (table) => ({
    uniqueUserDay: unique('user_day_unique').on(table.userId, table.dayDate),
  })
);

// TypeScript types inferred from Drizzle schema
export type DrizzleHabit = typeof habits.$inferSelect;
export type NewDrizzleHabit = typeof habits.$inferInsert;
export type DrizzleMonthlyGoal = typeof monthlyGoals.$inferSelect;
export type DrizzleHabitCompletion = typeof habitCompletions.$inferSelect;
export type DrizzleTask = typeof tasks.$inferSelect;
export type DrizzleDailyEntry = typeof dailyEntries.$inferSelect;
