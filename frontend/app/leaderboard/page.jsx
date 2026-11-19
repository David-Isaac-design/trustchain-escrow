'use client';

import { useEffect, useState } from 'react';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/reputation/leaderboard');

        if (!res.ok) {
          if (!cancelled) {
            setEntries([]);
            setError(`Failed to load leaderboard (status ${res.status}).`);
          }
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.leaderboard)
            ? data.leaderboard
            : Array.isArray(data?.entries)
              ? data.entries
              : [];

        if (!cancelled) {
          setEntries(list);
        }
      } catch (err) {
        if (!cancelled) {
          setEntries([]);
          setError('Failed to load leaderboard.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Reputation Leaderboard</h1>

      {loading && <p className="text-gray-500">Loading leaderboard…</p>}

      {!loading && error && (
        <p role="alert" className="rounded border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="text-gray-500">No reputation entries yet.</p>
      )}

      {!loading && !error && entries.length > 0 && (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Rank</th>
              <th className="py-2 pr-4">Address</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.address ?? index} className="border-b">
                <td className="py-2 pr-4">{entry.rank ?? index + 1}</td>
                <td className="py-2 pr-4 font-mono break-all">{entry.address}</td>
                <td className="py-2">{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
