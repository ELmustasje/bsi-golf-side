
import React from "react";
import type { Group } from "../types";
import { GroupGrid } from "../components/GroupGrid";
interface DashboardProps {
  groups: Group[] | null;
  busy: string | null;
  error: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ groups, busy, error }) => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="space-y-8">
        <header className="flex flex-col gap-3 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Live pairings
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Tonight&apos;s Simulator Groups</h1>
          <p className="text-sm text-slate-500">
            Up to six simulators are supported. For changes or reshuffles please contact an administrator.
          </p>
        </header>

        {(busy || error) && (
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white/70 p-4 text-center text-sm shadow-sm">
            {busy && <div className="font-semibold text-emerald-600">{busy}…</div>}
            {error && <div className="mt-2 text-red-600">{error}</div>}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-xl backdrop-blur">
          <GroupGrid groups={groups ?? []} />
        </div>
      </section>
    </main>
  );
};
