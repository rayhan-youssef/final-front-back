import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Upload PDFs',
    description: 'Add your study documents in one place. We extract text and track file size so you can focus on learning.',
    icon: '📄',
  },
  {
    title: 'AI-Powered Chat',
    description: 'Ask questions about your documents and get context-aware answers powered by AI.',
    icon: '💬',
  },
  {
    title: 'Summaries & Explanations',
    description: 'Generate concise summaries or dive into specific concepts with detailed explanations.',
    icon: '📋',
  },
  {
    title: 'Auto-Generated Flashcards',
    description: 'Turn any document into flip-style flashcards. Mark favorites for quick review.',
    icon: '🃏',
  },
  {
    title: 'AI Quiz Generator',
    description: 'Create multiple-choice quizzes with configurable question counts and see results with explanations.',
    icon: '✅',
  },
  {
    title: 'Progress Dashboard',
    description: 'Track your documents, flashcards, quizzes, and recent activity in one dashboard.',
    icon: '📊',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fdf5ea] to-[#eff6f8] px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-28 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-sans text-4xl font-bold tracking-tight text-teal-deep sm:text-5xl lg:text-6xl">
              Turn your PDFs into an interactive study experience
            </h1>
            <p className="mt-6 text-lg text-teal-muted sm:text-xl">
              Upload documents, chat with AI, generate flashcards and quizzes, and track your progress—all in one place.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth" className="btn-primary w-full min-w-[200px] py-3.5 px-8 text-base sm:w-auto">
                Get started
              </Link>
              <Link to="/auth" className="btn-secondary w-full min-w-[200px] py-3.5 px-8 text-base sm:w-auto">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-neutral-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-sans text-3xl font-semibold text-teal-deep sm:text-4xl">
              Everything you need to study smarter
            </h2>
            <p className="mt-4 text-lg text-teal-muted">
              One app for documents, AI help, flashcards, quizzes, and progress.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card flex flex-col"
              >
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-light text-2xl">
                  {feature.icon}
                </span>
                <h3 className="font-sans text-lg font-semibold text-teal-deep">
                  {feature.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-teal-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-200 bg-gradient-to-b from-teal-light/30 to-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mx-auto max-w-2xl rounded-2xl border border-teal-soft/20 bg-white px-6 py-12 text-center shadow-card sm:px-12 sm:py-16">
            <h2 className="font-sans text-2xl font-semibold text-teal-deep sm:text-3xl">
              Ready to study better?
            </h2>
            <p className="mt-4 text-teal-muted">
              Create a free account and upload your first PDF in seconds.
            </p>
            <Link
              to="/auth"
              className="btn-primary mt-8 inline-flex py-3.5 px-8 text-base"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-teal-muted">
            © {new Date().getFullYear()} Learn with us
          </p>
          <div className="flex gap-6">
            <Link to="/auth" className="text-sm font-medium text-teal-soft hover:text-teal-deep">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
