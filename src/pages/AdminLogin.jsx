import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const nextPath = useMemo(() => {
    return searchParams.get('next') || createPageUrl('Admin');
  }, [searchParams]);

  useEffect(() => {
    const checkSession = async () => {
      const user = await base44.auth.me();
      if (user) {
        navigate(nextPath, { replace: true });
        return;
      }

      setLoading(false);
    };

    checkSession();
  }, [navigate, nextPath]);

  const switchMode = (nextMode) => {
    const next = new URLSearchParams(searchParams);
    if (nextMode === 'register') {
      next.set('mode', 'register');
    } else {
      next.delete('mode');
    }

    setMode(nextMode);
    setSearchParams(next);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'register') {
        await base44.auth.register({ email, password });
        toast.success('Account created. You can now edit the portfolio.');
      } else {
        await base44.auth.login({ email, password });
        toast.success('Welcome back.');
      }

      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Unable to continue.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#007acc] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#cccccc] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#252526] border border-[#3c3c3c] rounded-xl overflow-hidden shadow-2xl">
        <div className="h-8 bg-[#323233] flex items-center px-4 border-b border-[#252526]">
          <span className="text-xs font-medium">admin-auth.js</span>
        </div>

        <div className="p-6">
          <p className="font-mono text-sm text-[#6a9955] mb-6">
            // Sign in or create an account to access /admin
          </p>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => switchMode('login')}
              className={mode === 'login' ? 'border-[#007acc] text-white' : 'border-[#3c3c3c] text-[#808080]'}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => switchMode('register')}
              className={mode === 'register' ? 'border-[#007acc] text-white' : 'border-[#3c3c3c] text-[#808080]'}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[#9cdcfe] font-mono text-sm block mb-2">email:</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] font-mono"
              />
            </div>

            <div>
              <label className="text-[#9cdcfe] font-mono text-sm block mb-2">password:</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                minLength={8}
                required
                className="bg-[#1e1e1e] border-[#3c3c3c] text-[#cccccc] font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#007acc] hover:bg-[#005a9e]"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : mode === 'register' ? (
                <UserPlus className="w-4 h-4 mr-2" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {mode === 'register' ? 'Create Account' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
