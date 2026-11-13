import TopNav from '@/components/layout/TopNav';
import ToastContainer from '@/components/ui/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <TopNav />
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 py-4">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}
