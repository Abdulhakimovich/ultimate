import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopNav from '@/components/layout/TopNav';
import ToastContainer from '@/components/ui/Toast';
import LegacyImportModal from '@/components/layout/LegacyImportModal';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient Electric Blue Aura for the Main Dashboard */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[360px] -z-0 blur-3xl opacity-20 dark:opacity-25"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, var(--electric), transparent 75%)',
        }}
        aria-hidden="true"
      />
      <TopNav />
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 py-4 relative z-10">
        {children}
      </main>
      <LegacyImportModal />
      <ToastContainer />
    </div>
  );
}
