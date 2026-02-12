import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

type Document = {
  _id: string;
  title: string;
  textContent?: string;
};

export function DocumentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [question, setQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [summary, setSummary] = useState('');
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get<Document>(`/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDoc(res.data))
      .catch(() => setDoc(null));
  }, [id]);

  async function callAI(endpoint: 'chat' | 'summary' | 'explain') {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (endpoint === 'chat') {
        const res = await axios.post(
          '/api/ai/chat',
          { documentId: id, message: question },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setChatAnswer(res.data.answer);
      } else if (endpoint === 'summary') {
        const res = await axios.post(
          '/api/ai/summary',
          { documentId: id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSummary(res.data.summary);
      } else {
        const res = await axios.post(
          '/api/ai/explain',
          { documentId: id, concept },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setExplanation(res.data.explanation);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDocument() {
    if (!id) return;
    const confirmed = window.confirm('Delete this document and its flashcards/quizzes?');
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/dashboard');
    } catch (err: any) {
      // Optional: you could surface this to the user with state
      // For now we'll just log to console
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  if (!doc) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-teal-muted">
        Loading document…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-teal-deep">{doc.title}</h1>
          <p className="mt-1 text-sm text-teal-muted">
            Ask questions, get summaries and explanations powered by Gemini.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/flashcards/${doc._id}`} className="btn-primary py-2.5 px-4 text-sm">
            Flashcards
          </Link>
          <Link to={`/quiz/${doc._id}`} className="btn-secondary py-2.5 px-4 text-sm">
            Quiz
          </Link>
          <button
            type="button"
            onClick={handleDeleteDocument}
            className="btn-secondary border-red-200 text-red-600 hover:bg-red-500 hover:text-white"
          >
            Delete
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card h-[480px] overflow-y-auto">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-teal-muted">
            Document preview
          </h2>
          <p className="whitespace-pre-wrap text-sm text-teal-deep">
            {doc.textContent?.slice(0, 8000) ?? 'Text preview not available for this PDF.'}
          </p>
        </section>

        <section className="space-y-4">
          <div className="card">
            <h2 className="mb-2 font-sans text-base font-semibold text-teal-deep">Chat about this document</h2>
            <textarea
              className="input mb-3 min-h-[100px]"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question…"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => callAI('chat')}
              className="btn-primary py-2.5 px-4 text-sm"
            >
              Ask Gemini
            </button>
            {chatAnswer && (
              <div className="mt-3 rounded-lg bg-teal-light/50 p-3 text-sm text-teal-deep">
                {chatAnswer}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-2 font-sans text-base font-semibold text-teal-deep">One-click summary</h2>
            <button
              type="button"
              disabled={loading}
              onClick={() => callAI('summary')}
              className="btn-primary py-2.5 px-4 text-sm"
            >
              Generate summary
            </button>
            {summary && (
              <div className="mt-3 rounded-lg bg-teal-light/50 p-3 text-sm text-teal-deep whitespace-pre-wrap">
                {summary}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-2 font-sans text-base font-semibold text-teal-deep">Explain a concept</h2>
            <input
              className="input mb-3"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g. gradient descent"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => callAI('explain')}
              className="btn-secondary py-2.5 px-4 text-sm"
            >
              Explain concept
            </button>
            {explanation && (
              <div className="mt-3 rounded-lg bg-teal-light/50 p-3 text-sm text-teal-deep whitespace-pre-wrap">
                {explanation}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
