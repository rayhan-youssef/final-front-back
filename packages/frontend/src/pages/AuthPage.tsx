import { FormEvent, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { AuthState } from '../App';

type Props = {
  onAuth(next: AuthState): void;
};

export function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload =
        mode === 'login'
          ? { email, password }
          : { email, password, name };
      const res = await axios.post(url, payload);
      onAuth({ token: res.data.token });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#fdf5ea] to-[#eff6f8]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12">
        <div className="card w-full">
          <h1 className="mb-1 font-sans text-2xl font-semibold text-teal-deep">
            Learn with us
          </h1>
          <p className="mb-6 text-sm text-teal-muted">
            Upload PDFs, chat with AI, and turn notes into flashcards & quizzes.
          </p>

          <div className="mb-6 flex gap-1 rounded-full bg-teal-wash p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium transition ${
                mode === 'login'
                  ? 'bg-white text-teal-deep shadow-sm'
                  : 'text-teal-soft hover:text-teal-deep'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium transition ${
                mode === 'signup'
                  ? 'bg-white text-teal-deep shadow-sm'
                  : 'text-teal-soft hover:text-teal-deep'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="input-label">Name</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            )}
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 w-full py-3"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
