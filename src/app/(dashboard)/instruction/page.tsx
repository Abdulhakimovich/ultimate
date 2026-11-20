import InstructionPage from '@/components/instruction/InstructionPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Guide & Instruction — Ultimate',
  description: 'Complete user guide, habit-building strategies, and FAQ for Ultimate Habit Tracker.',
};

export default function Page() {
  return <InstructionPage />;
}
