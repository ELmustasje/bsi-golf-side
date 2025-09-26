
import React, { useEffect, useMemo, useState } from "react";
import { api, ApiClient } from "../api/client";
import type { Attendee, Group, ShuffleResponse } from "../types";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { GroupGrid } from "../components/GroupGrid";

const LS_KEY_BASEURL = "sims.api.baseurl";

export const Dashboard: React.FC = () => {
  const [baseUrl, setBaseUrl] = useLocalStorage(LS_KEY_BASEURL, api.baseUrl);
  const client = useMemo(() => new ApiClient(baseUrl), [baseUrl]);

  const [groups, setGroups] = useState<Group[] | null>(null);
  const [simCount, setSimCount] = useState<number>(4);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function safe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
    setBusy(label);
    setError(null);
    try {
      const out = await fn();
      return out;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(null);
    }
  }

  // Initial load
  useEffect(() => {

    safe("Loading groups", async () => {
      const data = await client.getGroups();
      setGroups(data);
      return null;
    });
  }, [client]);

  return (
    <div className="mx-auto max-w-6xl p-4 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Spond Sims</h1>
          <p className="text-sm opacity-80">Frontend for your FastAPI groups/attendees service.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="w-[24rem] rounded-xl border px-3 py-2 text-sm"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="API base URL (e.g., http://localhost:8000)"
          />
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={!!busy}
            onClick={() =>
              safe("Pulling from Spond", async () => {
                const a = await client.pullFromSpond();
                return null;
              })
            }
            className="rounded-xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Pull from Spond
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm">Simulators:</label>
            <input
              type="number"
              min={1}
              className="w-20 rounded-xl border px-3 py-2 text-sm"
              value={simCount}
              onChange={(e) => setSimCount(Math.max(1, Number(e.target.value)))}
            />
            <button
              disabled={!!busy}
              onClick={() =>
                safe("Shuffling groups", async () => {
                  const res: ShuffleResponse = await client.shuffle(simCount);
                  setGroups(res.groups);
                  return null;
                })
              }
              className="rounded-xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-60"
            >
              Shuffle
            </button>
            <button
              disabled={!!busy}
              onClick={() =>
                safe("Loading saved groups", async () => {
                  const g = await client.getGroups();
                  setGroups(g);
                  return null;
                })
              }
              className="rounded-xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-60"
            >
              Load saved groups
            </button>

            {busy && <span className="text-sm italic opacity-70">{busy}…</span>}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-lg font-semibold">Groups</h2>
            <GroupGrid groups={groups ?? []} />
          </div>
        </div>
      </section>
    </div>
  );
};
