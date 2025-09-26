import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { api, ApiClient } from "./api/client";
import type { Attendee, Group, ShuffleResponse } from "./types";

type View = "dashboard" | "admin";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [baseUrl, setBaseUrl] = useLocalStorage("sims.api.baseurl", api.baseUrl);
  const client = useMemo(() => new ApiClient(baseUrl), [baseUrl]);

  const [groups, setGroups] = useState<Group[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [simCount, setSimCount] = useState<number>(4);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attendeesUpdatedAt, setAttendeesUpdatedAt] = useState<Date | null>(null);
  const [groupsUpdatedAt, setGroupsUpdatedAt] = useState<Date | null>(null);

  const safe = useCallback(async <T,>(label: string, fn: () => Promise<T>) => {
    setBusy(label);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError((e as Error).message ?? "Something went wrong");
      throw e;
    } finally {
      setBusy(null);
    }
  }, []);

  const fetchAttendees = useCallback(async () => {
    const data = await client.getAttendees();
    setAttendees(data);
    setAttendeesUpdatedAt(new Date());
    return data;
  }, [client]);

  const fetchGroups = useCallback(async () => {
    const data = await client.getGroups();
    setGroups(data);
    setGroupsUpdatedAt(new Date());
    return data;
  }, [client]);

  const initialize = useCallback(
    () =>
      safe("Loading data", async () => {
        await Promise.all([fetchAttendees(), fetchGroups()]);
        return null;
      }),
    [safe, fetchAttendees, fetchGroups]
  );

  useEffect(() => {
    initialize().catch(() => null);
  }, [initialize]);

  const handlePullFromSpond = useCallback(
    () =>
      safe("Pulling from Spond", async () => {
        const pulled = await client.pullFromSpond();
        setAttendees(pulled);
        setAttendeesUpdatedAt(new Date());
        await fetchGroups();
        return pulled;
      }),
    [client, fetchGroups, safe]
  );

  const handleShuffle = useCallback(
    () =>
      safe("Shuffling groups", async () => {
        const res: ShuffleResponse = await client.shuffle(simCount);
        setGroups(res.groups);
        setGroupsUpdatedAt(new Date());
        const flattened = res.groups.flatMap((group) => group.members ?? []);
        setAttendees(flattened);
        setAttendeesUpdatedAt(new Date());
        return res;
      }),
    [client, safe, simCount]
  );

  const handleLoadSaved = useCallback(
    () =>
      safe("Reloading saved data", async () => {
        await Promise.all([fetchAttendees(), fetchGroups()]);
        return null;
      }),
    [fetchAttendees, fetchGroups, safe]
  );

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight text-slate-900">Spond Sims</div>
            <p className="text-sm text-slate-500">Monitor simulator lineups and manage data syncing.</p>
          </div>
          <nav className="flex items-center gap-2 rounded-full bg-slate-100 p-1 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setView("dashboard")}
              className={`rounded-full px-4 py-1.5 transition ${
                view === "dashboard"
                  ? "bg-white text-slate-900 shadow"
                  : "hover:text-slate-900 hover:shadow-sm"
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setView("admin")}
              className={`rounded-full px-4 py-1.5 transition ${
                view === "admin" ? "bg-white text-slate-900 shadow" : "hover:text-slate-900 hover:shadow-sm"
              }`}
            >
              Admin
            </button>
          </nav>
        </div>
      </header>

      {view === "dashboard" ? (
        <Dashboard groups={groups} busy={busy} error={error} />
      ) : (
        <AdminDashboard
          baseUrl={baseUrl}
          setBaseUrl={setBaseUrl}
          simCount={simCount}
          setSimCount={setSimCount}
          busy={busy}
          error={error}
          onPullFromSpond={handlePullFromSpond}
          onShuffle={handleShuffle}
          onLoadSaved={handleLoadSaved}
          attendees={attendees}
          groups={groups}
          attendeesUpdatedAt={attendeesUpdatedAt}
          groupsUpdatedAt={groupsUpdatedAt}
        />
      )}
    </div>
  );
}
