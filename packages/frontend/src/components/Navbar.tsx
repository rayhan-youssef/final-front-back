import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '/logo.png';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    setMobileOpen(false);
    navigate('/');
    window.location.reload();
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/98 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to={token ? '/dashboard' : '/'}
          className="flex items-center gap-2 font-sans text-xl font-semibold text-teal-deep transition hover:opacity-90"
        >
          <img src={logo} alt="Learn with us logo" className="h-8 w-8 object-contain" />
          <span className="hidden sm:inline">Learn with us</span>
          <span className="sm:hidden">Learn with us</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {token ? (
            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary py-2 px-4 text-sm"
            >
              Log out
            </button>
          ) : (
            <Link to="/auth" className="btn-primary py-2 px-4 text-sm">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="flex flex-col justify-center gap-1.5 rounded-lg p-2 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`h-0.5 w-6 rounded-full bg-teal-deep transition ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span className={`h-0.5 w-6 rounded-full bg-teal-deep transition ${mobileOpen ? 'opacity-0' : ''}`} />
          <span
            className={`h-0.5 w-6 rounded-full bg-teal-deep transition ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {token ? (
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary w-full justify-center py-2.5"
              >
                Log out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full justify-center py-2.5"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
