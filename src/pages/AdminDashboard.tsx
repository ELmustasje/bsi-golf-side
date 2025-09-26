import React, { useMemo, useState } from "react";

interface AdminDashboardProps {
  baseUrl: string;
  setBaseUrl: (url: string) => void;
  simCount: number;
  setSimCount: (count: number) => void;
  busy: string | null;
  error: string | null;
  onPullFromSpond: () => Promise<unknown>;
  onShuffle: () => Promise<unknown>;
  onLoadSaved: () => Promise<unknown>;
}

const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD ?? "letmein";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  baseUrl,
  setBaseUrl,
  simCount,
  setSimCount,
  busy,
  error,
  onPullFromSpond,
  onShuffle,
  onLoadSaved,
}) => {
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const maskedBaseUrl = useMemo(() => {
    try {
      const url = new URL(baseUrl);
      return `${url.protocol}//${url.host}`;
    } catch (e) {
      return baseUrl;
    }
  }, [baseUrl]);

  const handleAuth = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordInput.trim() === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      setAuthError(null);
      setPasswordInput("");
    } else {
      setAuthError("Incorrect password. Please try again.");
    }
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <header className="mb-6 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Admin</span>
          <h1 className="text-3xl font-bold text-slate-900">Control Center</h1>
          <p className="text-sm text-slate-500">
            Manage integrations, shuffles and data sources. Changes here affect what everyone sees on the
            public dashboard.
          </p>
        </header>

        {!isUnlocked ? (
          <form onSubmit={handleAuth} className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-slate-600">
                Admin password
              </label>
              <input
                id="admin-password"
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>
            {authError && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{authError}</div>}
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            >
              Unlock controls
            </button>
            <p className="text-xs text-slate-500">
              The default password can be overridden by setting <code className="font-semibold">REACT_APP_ADMIN_PASSWORD</code>
              in your environment.
            </p>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Connected API</h2>
                  <p className="text-sm text-slate-500">Base endpoint currently pointed at {maskedBaseUrl || "—"}.</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={baseUrl}
                  onChange={(event) => setBaseUrl(event.target.value)}
                  placeholder="API base URL (e.g., http://localhost:8000)"
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <button
                  type="button"
                  onClick={onLoadSaved}
                  disabled={!!busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Refresh groups
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-base font-semibold text-slate-800">Simulator controls</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <label className="text-sm font-medium text-slate-600">Simulators</label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      value={simCount}
                      onChange={(event) => setSimCount(Math.max(1, Number(event.target.value) || 1))}
                    />
                    <span className="text-xs uppercase tracking-widest text-slate-500">Slots</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:justify-self-end">
                  <button
                    type="button"
                    onClick={onShuffle}
                    disabled={!!busy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Shuffle &amp; publish
                  </button>
                  <button
                    type="button"
                    onClick={onPullFromSpond}
                    disabled={!!busy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Pull from Spond
                  </button>
                </div>
              </div>
            </div>

            {(busy || error) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                {busy && <div className="font-semibold text-emerald-600">{busy}…</div>}
                {error && <div className="mt-2 rounded-xl bg-red-50 p-3 text-red-700">{error}</div>}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

