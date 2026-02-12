import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

type Document = {
  _id: string;
  title: string;
  originalFileName: string;
  createdAt: string;
};

type DashboardSummary = {
  totals: {
    documents: number;
    flashcards: number;
    quizzes: number;
    favorites: number;
  };
  recentActivity: Array<
    | { type: 'document'; id: string; title: string; createdAt: string }
    | { type: 'quiz'; id: string; createdAt: string }
  >;
};

export function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get<Document[]>('/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDocuments(res.data))
      .catch(() => setDocuments([]));

    axios
      .get<DashboardSummary>('/api/dashboard/summary', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', file);
      form.append('title', file.name);
      const res = await axios.post('/api/documents/upload', form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDocuments((prev) => [res.data, ...prev]);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-teal-deep">
            Your study workspace
          </h1>
          <p className="mt-1 text-sm text-teal-muted">
            Upload PDFs, then open them to chat with AI, generate flashcards, and quizzes.
          </p>
        </div>
        <label className="btn-primary inline-flex cursor-pointer items-center gap-2">
          <span>{uploading ? 'Uploading…' : 'Upload PDF'}</span>
          <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
        </label>
      </header>

      {summary && (
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card card--flat p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-muted">Documents</p>
            <p className="mt-2 font-sans text-2xl font-semibold text-teal-deep">{summary.totals.documents}</p>
          </div>
          <div className="card card--flat p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-muted">Flashcards</p>
            <p className="mt-2 font-sans text-2xl font-semibold text-teal-deep">{summary.totals.flashcards}</p>
          </div>
          <div className="card card--flat p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-muted">Quizzes</p>
            <p className="mt-2 font-sans text-2xl font-semibold text-teal-deep">{summary.totals.quizzes}</p>
          </div>
          <div className="card card--flat p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-teal-muted">Favorites</p>
            <p className="mt-2 font-sans text-2xl font-semibold text-teal-deep">{summary.totals.favorites}</p>
          </div>
        </section>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <section>
          <h2 className="mb-4 font-sans text-lg font-semibold text-teal-deep">Your documents</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {documents.map((doc) => (
              <Link
                key={doc._id}
                to={`/documents/${doc._id}`}
                className="card flex flex-col justify-between"
              >
                <div>
                  <h3 className="mb-1 font-medium text-teal-deep">{doc.title}</h3>
                  <p className="text-xs text-teal-muted">{doc.originalFileName}</p>
                </div>
                <div className="mt-4 text-xs text-teal-muted">
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
            {documents.length === 0 && (
              <p className="col-span-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-teal-muted">
                No documents yet. Upload a PDF to get started.
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-sans text-lg font-semibold text-teal-deep">Recent activity</h2>
          <div className="card card--flat divide-y divide-neutral-200">
            {summary && summary.recentActivity.length > 0 ? (
              summary.recentActivity.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-teal-deep">
                      {item.type === 'document' ? item.title : 'Quiz created'}
                    </p>
                    <p className="text-xs text-teal-muted">
                      {item.type === 'document' ? 'New document' : 'New quiz'}
                    </p>
                  </div>
                  <span className="text-xs text-teal-muted">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-teal-muted">
                Activity will appear here as you add documents and quizzes.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
