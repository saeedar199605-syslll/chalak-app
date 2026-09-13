import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { useRealtimeRoom } from './lib/realtime/useRealtimeRoom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { EvaluationsList } from './components/EvaluationsList';
import { EvaluationFormModal } from './components/EvaluationFormModal';
import { NineBoxGrid } from './components/NineBoxGrid';
import { CalibrationView } from './components/CalibrationView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 30000,
      retry: 2
    }
  }
});

function AppContent() {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const [currentTab, setCurrentTab] = useState('evaluations');
  const [activeEvalId, setActiveEvalId] = useState<string | null>(null);

  const { status: connectionStatus, activePeers } = useRealtimeRoom(user?.workspaceId || 'default_org');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm" dir="rtl">
        در حال اتصال به زیرساخت ابری Cloudflare...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      <Navbar connectionStatus={connectionStatus} activePeers={activePeers} />

      <div className="flex flex-1">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        <main className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {currentTab === 'dashboard' && <EvaluationsList onSelectEvaluation={setActiveEvalId} onOpenCreateModal={() => {}} />}
          {currentTab === 'evaluations' && <EvaluationsList onSelectEvaluation={setActiveEvalId} onOpenCreateModal={() => {}} />}
          {currentTab === 'ninebox' && <NineBoxGrid />}
          {currentTab === 'calibration' && <CalibrationView />}
          {currentTab === 'reports' && <CalibrationView />}
          {currentTab === 'employees' && <div className="text-slate-400 text-sm">بخش مدیریت پرسنل (اتصال مستقیم به جدول employees در Cloudflare D1)</div>}
          {currentTab === 'criteria' && <div className="text-slate-400 text-sm">بانک شایستگی‌ها و شاخص‌های فنی (جدول criteria)</div>}
          {currentTab === 'job_profiles' && <div className="text-slate-400 text-sm">پروفایل‌های شغلی و اوزان شایستگی‌ها (جدول job_profiles)</div>}
          {currentTab === 'backups' && <div className="text-slate-400 text-sm">مدیریت پشتیبان‌های امنیتی در مخزن Cloudflare R2</div>}
        </main>
      </div>

      {activeEvalId && (
        <EvaluationFormModal
          evaluationId={activeEvalId}
          onClose={() => setActiveEvalId(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
