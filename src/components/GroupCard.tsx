
import React from "react";
import type { Group } from "../types";

export const GroupCard: React.FC<{ group: Group; index?: number }> = ({ group }) => {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="mb-2 text-lg font-semibold">Simulator {group.group_id}</div>
      <ul className="list-disc pl-5 text-sm">
        {group.members.map((m, i) => (
          <li key={i}>{String(m.name ?? m.full_name ?? m.display_name ?? Object.values(m)[0])}</li>
        ))}
      </ul>
    </div>
  );
};
