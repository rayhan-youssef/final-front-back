import { Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { QuizPage } from './pages/QuizPage';
import { AuthPage } from './pages/AuthPage';

export type AuthState = {
  token: string | null;
};

export function useAuthState(): [AuthState, (next: AuthState) => void] {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    return { token };
  });

  const update = (next: AuthState) => {
    if (next.token) {
      localStorage.setItem('token', next.token);
    } else {
      localStorage.removeItem('token');
    }
    setState(next);
  };

  return [state, update];
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const [auth, setAuth] = useAuthState();

  return (
    <div className="min-h-screen bg-page-bg text-teal-deep">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage onAuth={setAuth} />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <PrivateRoute>
                <DocumentsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/flashcards/:id"
            element={
              <PrivateRoute>
                <FlashcardsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/quiz/:id"
            element={
              <PrivateRoute>
                <QuizPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
