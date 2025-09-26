
import React from "react";
import type { Group } from "../types";
import { getDisplayName } from "../utils/displayName";

export const GroupCard: React.FC<{ group: Group; index?: number }> = ({ group }) => {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-sky-50" aria-hidden="true" />
      <div className="relative flex h-full flex-col gap-5 p-6">
        <div className="flex items-start justify-between">
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Simulator</p>
            <h2 className="text-3xl font-black text-slate-900">{group.group_id}</h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-lg font-semibold text-emerald-600">
            {group.members.length}
          </div>
        </div>

        <ul className="flex flex-1 flex-col gap-2 text-lg font-medium text-slate-800">
          {group.members.map((member, index) => {
            const memberName = getDisplayName(member, index + 1);
            return (
              <li key={index} className="flex items-center gap-3 rounded-2xl bg-white/60 px-3 py-2 text-left shadow-sm">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-emerald-500/80 text-xs font-bold uppercase tracking-widest text-white">
                  {index + 1}
                </span>
                <span>{memberName}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
};
