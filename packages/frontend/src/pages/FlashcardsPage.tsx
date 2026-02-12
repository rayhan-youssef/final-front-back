import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

type Flashcard = {
  _id: string;
  front: string;
  back: string;
  isFavorite: boolean;
};

export function FlashcardsPage() {
  const { id } = useParams();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    axios
      .get<Flashcard[]>(`/api/flashcards/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCards(res.data))
      .catch(() => setCards([]));
  }, [id]);

  async function generateFlashcards() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/ai/flashcards',
        { documentId: id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCards(res.data);
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Failed to generate flashcards.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(cardId: string, current: boolean) {
    const token = localStorage.getItem('token');
    const res = await axios.patch<Flashcard>(
      `/api/flashcards/${cardId}/favorite`,
      { isFavorite: !current },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setCards((prev) => prev.map((c) => (c._id === cardId ? res.data : c)));
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-semibold text-teal-deep">Flashcards</h1>
          <p className="mt-1 text-sm text-teal-muted">
            Auto-generated Q/A flashcards with flip interaction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="btn-ghost py-2.5 px-4 text-sm">
            ← Dashboard
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={generateFlashcards}
            className="btn-primary py-2.5 px-4 text-sm"
          >
            {loading ? 'Generating…' : 'Generate from PDF'}
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const flipped = card._id === flippedId;
          return (
            <div key={card._id} className="card flex flex-col">
              <button
                type="button"
                onClick={() => setFlippedId(flipped ? null : card._id)}
                className="min-h-[140px] flex-1 rounded-lg border border-neutral-200 bg-neutral-50/80 p-4 text-left text-sm text-teal-deep transition hover:border-teal-soft/40 hover:bg-teal-light/30"
              >
                {flipped ? card.back : card.front}
              </button>
              <div className="mt-3 flex items-center justify-between text-xs text-teal-muted">
                <span>{flipped ? 'Answer' : 'Question'}</span>
                <button
                  type="button"
                  onClick={() => toggleFavorite(card._id, card.isFavorite)}
                  className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition ${
                    card.isFavorite
                      ? 'bg-orange-wash text-orange-solar'
                      : 'bg-neutral-100 text-teal-muted hover:bg-teal-wash'
                  }`}
                >
                  {card.isFavorite ? '★ Favorite' : '☆ Favorite'}
                </button>
              </div>
            </div>
          );
        })}
        {cards.length === 0 && (
          <p className="col-span-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-teal-muted">
            No flashcards yet. Click &quot;Generate from PDF&quot; to create a set.
          </p>
        )}
      </div>
    </div>
  );
}
