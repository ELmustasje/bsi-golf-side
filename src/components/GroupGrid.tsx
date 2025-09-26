
import React from "react";
import type { Group } from "../types";
import { GroupCard } from "./GroupCard";

export const GroupGrid: React.FC<{ groups: Group[] }> = ({ groups }) => {
  if (!groups?.length)
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/50 p-10 text-center text-sm text-slate-500">
        <span className="text-lg font-semibold text-slate-600">No groups yet</span>
        <p>Once an administrator publishes a shuffle the simulators will appear here.</p>
      </div>
    );
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <GroupCard key={group.group_id} group={group} />
      ))}
    </div>
  );
};
