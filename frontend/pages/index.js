import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';
import { saveAuth, getAuth } from '../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    const auth = getAuth();
    if (auth?.email) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data = await api.login(email);
      saveAuth(data);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="card w-full max-w-md bg-gradient-to-br from-white to-slate-50 shadow-xl">
        <h1 className="text-2xl font-semibold text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Welcome back
        </h1>
        <p className="text-sm text-center text-slate-500 mb-6">
          Enter your email to continue
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-slate-200 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 font-semibold disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-xs text-center text-slate-500 mt-4">
          Mock login only. Any email works.
        </p>
      </div>
    </div>
  );
}

