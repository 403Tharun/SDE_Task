import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { clearAuth, getAuth } from '../lib/auth';

export default function NavBar() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    setEmail(auth?.email || '');
  }, [router.pathname]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="bg-gradient-to-r from-white to-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition">
          Mini Task Manager
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/dashboard"
            className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/analytics"
            className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
            Analytics
          </Link>
          {email && (
            <span className="text-slate-600 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              {email}
            </span>
          )}
          <button
            type="button"
            className="border border-red-500 text-red-500 px-3 py-1 rounded-md text-xs font-medium hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 hover:shadow-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}


