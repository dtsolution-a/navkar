import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LogOut, WifiOff, Wifi } from 'lucide-react';
import useSelectionStore from './store';
import selectionToolAPI from './api';

function registerPwaShell() {
  // Manifest/SW are scoped to /selection-tool only — injected here rather
  // than in the shared index.html, since that HTML is also served for the
  // main marketing site and the admin panel, neither of which should be
  // installable as this app.
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/selection-tool-manifest.webmanifest';
    document.head.appendChild(link);
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/selection-tool-sw.js', { scope: '/selection-tool/' }).catch(() => {});
  }
}

export default function SelectionLayout() {
  const navigate = useNavigate();
  const { user, online, init, logout } = useSelectionStore();

  useEffect(() => { init(); registerPwaShell(); }, []);

  if (!selectionToolAPI.isAuthenticated()) {
    return <Navigate to="/selection-tool/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-surface-dark">
      <header className="sticky top-0 z-40 bg-white dark:bg-surface-dark-card border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/selection-tool')} className="font-bold text-lg text-gray-900 dark:text-white">
            Navkar <span className="text-accent">Selection Tool</span>
          </button>
          <div className="flex items-center gap-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                online ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
              }`}
            >
              {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {online ? 'Online' : 'Offline — using cached catalog'}
            </span>
            <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">{user?.username}</span>
            <button
              onClick={() => { logout(); navigate('/selection-tool/login'); }}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-accent dark:text-gray-400"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
