
import React from "react";
import type { Group } from "../types";
import { GroupCard } from "./GroupCard";

export const GroupGrid: React.FC<{ groups: Group[] }> = ({ groups }) => {
  if (!groups?.length)
    return <div className="text-sm italic opacity-70">No groups yet.</div>;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <GroupCard key={g.group_id} group={g} />
      ))}
    </div>
  );
};
