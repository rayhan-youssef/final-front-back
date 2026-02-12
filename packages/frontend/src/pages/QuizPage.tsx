import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

type Quiz = {
  _id: string;
  questions: Question[];
};

export function QuizPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    axios
      .get<Quiz>(`/api/quizzes/latest/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setQuiz(res.data);
        setAnswers(new Array(res.data.questions.length).fill(-1));
      })
      .catch(() => setQuiz(null));
  }, [id]);

  async function generateQuiz() {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/ai/quiz',
        { documentId: id, questionCount: 10 },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill(-1));
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  }

  if (!quiz) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-semibold text-teal-deep">Quiz</h1>
            <p className="mt-1 text-sm text-teal-muted">
              Generate a multiple-choice quiz from your PDF.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="btn-ghost py-2.5 px-4 text-sm">
              ← Dashboard
            </Link>
            <button
              type="button"
              disabled={loading}
              onClick={generateQuiz}
              className="btn-primary py-2.5 px-4 text-sm"
            >
              {loading ? 'Generating…' : 'Generate quiz'}
            </button>
          </div>
        </header>
        <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-teal-muted">
          No quiz yet for this document.
        </p>
      </div>
    );
  }

  const correctCount = quiz.questions.reduce(
    (acc, q, i) => (answers[i] === q.correctIndex ? acc + 1 : acc),
    0,
  );
  const totalQuestions = quiz.questions.length;
  const incorrectCount = totalQuestions - correctCount;
  const percentage = Math.round((correctCount / Math.max(totalQuestions, 1)) * 100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-teal-deep">Quiz</h1>
          <p className="mt-1 text-sm text-teal-muted">
            Answer the questions, then reveal correct answers and explanations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="btn-ghost py-2.5 px-4 text-sm">
            ← Dashboard
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={generateQuiz}
            className="btn-secondary py-2.5 px-4 text-sm"
          >
            {loading ? 'Regenerating…' : 'Regenerate quiz'}
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {quiz.questions.map((q, i) => (
          <div key={i} className="card">
            <p className="mb-3 font-medium text-teal-deep">
              Q{i + 1}. {q.question}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, idx) => {
                const selected = answers[i] === idx;
                const isCorrect = q.correctIndex === idx;
                const show = showResults;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (showResults) return;
                      setAnswers((prev) => {
                        const next = [...prev];
                        next[i] = idx;
                        return next;
                      });
                    }}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      show
                        ? isCorrect
                          ? 'border-green-500 bg-green-50 text-teal-deep'
                          : selected
                            ? 'border-red-400 bg-red-50 text-teal-deep'
                            : 'border-neutral-200 bg-white text-teal-muted'
                        : selected
                          ? 'border-teal-soft bg-teal-light/50 text-teal-deep'
                          : 'border-neutral-200 bg-white text-teal-deep hover:border-teal-soft/50 hover:bg-teal-light/30'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {showResults && q.explanation && (
              <p className="mt-3 rounded-lg bg-teal-light/50 p-3 text-xs text-teal-deep">
                {q.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      <footer className="mt-8 border-t border-neutral-200 pt-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setShowResults(true);
              setShowScoreModal(true);
            }}
            className="btn-primary py-2.5 px-4 text-sm"
          >
            {showResults ? 'Show score' : 'Reveal answers'}
          </button>
        </div>
      </footer>

      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-sans text-lg font-semibold text-teal-deep">Your score</h2>
              <button
                type="button"
                onClick={() => setShowScoreModal(false)}
                className="rounded-full px-2 py-1 text-sm text-teal-muted hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-light/70 text-2xl">
                🏆
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-muted">
                Your score
              </p>
              <p className="mt-1 font-sans text-3xl font-semibold text-orange-500">{percentage}%</p>
              <p className="mt-1 text-sm text-teal-muted">
                {percentage === 100
                  ? 'Perfect!'
                  : percentage >= 70
                    ? 'Great job!'
                    : percentage >= 40
                      ? 'Not bad – keep practicing.'
                      : 'Good start – try again to improve.'}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs font-medium">
                <span className="rounded-full border border-neutral-200 px-3 py-1 text-teal-muted">
                  {totalQuestions} Total
                </span>
                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700">
                  {correctCount} Correct
                </span>
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">
                  {incorrectCount} Incorrect
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowScoreModal(false)}
                className="mt-4 btn-primary py-2.5 px-6 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
