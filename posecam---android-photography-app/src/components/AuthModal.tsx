import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User as UserIcon, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, logout } = useAuth();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message?.replace('Firebase: ', '') || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message?.replace('Firebase: ', '') || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsGuest();
      onClose();
    } catch (err: any) {
      setError(err?.message?.replace('Firebase: ', '') || 'Guest sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setLoading(true);
    try {
      await logout();
      onClose();
    } catch (err: any) {
      setError(err?.message?.replace('Firebase: ', '') || 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/60 hover:bg-neutral-800 transition"
        >
          <X size={16} />
        </button>

        {user ? (
          /* Profile & Sign Out View */
          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={28} className="text-amber-400" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-white">
                {user.displayName || (user.isAnonymous ? 'Guest User' : 'Authenticated User')}
              </h3>
              <p className="text-xs text-neutral-400">{user.email || 'Signed in via Firebase Auth'}</p>
              <div className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 mt-1">
                <CheckCircle2 size={11} />
                <span>Connected to Firebase Auth</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full mt-4 h-11 bg-neutral-800 hover:bg-neutral-700 active:scale-[0.98] border border-neutral-700 rounded-xl text-neutral-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              {loading ? <Loader2 size={14} className="animate-spin text-amber-400" /> : <LogOut size={14} />}
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-white">
                {isSignUp ? 'Create Account' : 'Sign In to PoseCam'}
              </h3>
              <p className="text-xs text-neutral-400">Firebase Authentication</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-xs text-red-300">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full h-11 bg-white hover:bg-neutral-100 active:scale-[0.98] text-neutral-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-neutral-800" />
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">or email</span>
              <div className="flex-1 h-px bg-neutral-800" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {isSignUp && (
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3 top-3.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Your Name (optional)"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3.5 text-neutral-500" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="relative">
                <Lock size={14} className="absolute left-3 top-3.5 text-neutral-500" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="hover:text-amber-300 transition underline underline-offset-2"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>

              <button
                type="button"
                onClick={handleGuest}
                disabled={loading}
                className="text-neutral-500 hover:text-neutral-300 transition"
              >
                Guest Sign-In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
