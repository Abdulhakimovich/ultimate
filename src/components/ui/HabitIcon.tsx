'use client';

import React from 'react';
import {
  Moon,
  BookOpen,
  Droplets,
  Footprints,
  Dumbbell,
  Sparkles,
  Pill,
  PenLine,
  Code,
  Music,
  Utensils,
  Sparkle,
  Apple,
  Languages,
  Heart,
  Target,
  Flame,
  CheckCircle2,
  Smile,
  Zap,
} from 'lucide-react';

interface HabitIconProps {
  icon: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Map of key or emoji to Lucide icon component
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  // Lucide keys
  moon: Moon,
  sleep: Moon,
  book: BookOpen,
  reading: BookOpen,
  water: Droplets,
  droplets: Droplets,
  smoothie: Droplets,
  steps: Footprints,
  walk: Footprints,
  footprints: Footprints,
  exercise: Dumbbell,
  fitness: Dumbbell,
  stretching: Dumbbell,
  dumbbell: Dumbbell,
  meditation: Sparkles,
  sparkles: Sparkles,
  vitamins: Pill,
  pill: Pill,
  journal: PenLine,
  pen: PenLine,
  coding: Code,
  code: Code,
  music: Music,
  cooking: Utensils,
  utensils: Utensils,
  cleaning: Sparkle,
  sparkle: Sparkle,
  'no-sugar': Apple,
  apple: Apple,
  languages: Languages,
  english: Languages,
  heart: Heart,
  target: Target,
  flame: Flame,
  zap: Zap,
  smile: Smile,

  // Legacy emojis mapped to Lucide icons
  '🌙': Moon,
  '📚': BookOpen,
  '🥤': Droplets,
  '💧': Droplets,
  '👣': Footprints,
  '🚶': Footprints,
  '🏃': Dumbbell,
  '🤸': Dumbbell,
  '🧘': Sparkles,
  '💊': Pill,
  '✍️': PenLine,
  '✍': PenLine,
  '💻': Code,
  '🎵': Music,
  '🍳': Utensils,
  '🧹': Sparkle,
  '🚫': Apple,
  '🇬🇧': Languages,
  'GB': Languages,
  '🇺🇸': Languages,
  'US': Languages,
  '❤️': Heart,
  '🎯': Target,
  '🔥': Flame,
  '⚡': Zap,
  '✨': Sparkles,
};

export default function HabitIcon({
  icon,
  size = 15,
  className = '',
  style,
}: HabitIconProps) {
  const IconComponent = ICON_MAP[icon] || ICON_MAP[icon.toLowerCase()] || CheckCircle2;
  return <IconComponent size={size} className={className} style={style} />;
}
