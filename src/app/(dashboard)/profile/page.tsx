import ProfilePage from '@/components/profile/ProfilePage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile — Ultimate',
  description: 'Manage your Ultimate account, preferences, and personal stats.',
};

export default function Page() {
  return <ProfilePage />;
}
