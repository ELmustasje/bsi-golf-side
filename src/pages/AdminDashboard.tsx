import React, { useCallback, useMemo, useState } from "react";
import type { Attendee, Group } from "../types";

interface AdminDashboardProps {
  baseUrl: string;
  setBaseUrl: (url: string) => void;
  simCount: number;
  setSimCount: (count: number) => void;
  busy: string | null;
  error: string | null;
  onPullFromSpond: () => Promise<unknown>;
  onShuffle: () => Promise<unknown>;
  onSwap: (attendeeOne: string, attendeeTwo: string) => Promise<unknown>;
  onLoadSaved: () => Promise<unknown>;
  attendees: Attendee[];
  groups: Group[];
  attendeesUpdatedAt: Date | null;
  groupsUpdatedAt: Date | null;
}

const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD ?? "letmein";

const formatTimestamp = (value: Date | null) => {
  if (!value) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
};

const getDisplayName = (person: Attendee, fallbackIndex: number) => {
  if (person == null) {
    return `Attendee ${fallbackIndex}`;
  }

  if (typeof person === "string" || typeof person === "number") {
    return String(person);
  }

  const record = person as Record<string, unknown>;
  const primaryKeys = ["name", "full_name", "fullName", "display_name", "displayName"];
  for (const key of primaryKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const firstName =
    typeof record.first_name === "string"
      ? record.first_name
      : typeof record.firstName === "string"
        ? record.firstName
        : "";
  const lastName =
    typeof record.last_name === "string"
      ? record.last_name
      : typeof record.lastName === "string"
        ? record.lastName
        : "";

  const combined = `${firstName} ${lastName}`.trim();
  if (combined) {
    return combined;
  }

  if (typeof record.email === "string" && record.email.trim()) {
    return record.email.trim();
  }

  if (record.id != null) {
    return `#${record.id}`;
  }

  return `Attendee ${fallbackIndex}`;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  baseUrl,
  setBaseUrl,
  simCount,
  setSimCount,
  busy,
  error,
  onPullFromSpond,
  onShuffle,
  onSwap,
  onLoadSaved,
  attendees,
  groups,
  attendeesUpdatedAt,
  groupsUpdatedAt,
}) => {
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<string | null>(null);
  const [draggedAttendee, setDraggedAttendee] = useState<string | null>(null);

  const maskedBaseUrl = useMemo(() => {
    try {
      const url = new URL(baseUrl);
      return `${url.protocol}//${url.host}`;
    } catch (e) {
      return baseUrl;
    }
  }, [baseUrl]);

  const totalGroupMembers = useMemo(
    () => groups.reduce((sum, group) => sum + (group.members?.length ?? 0), 0),
    [groups]
  );

  const attendeePreview = useMemo(() => attendees.slice(0, 12), [attendees]);
  const remainingAttendees = attendees.length - attendeePreview.length;

  const formattedAttendeesUpdated = useMemo(() => formatTimestamp(attendeesUpdatedAt), [attendeesUpdatedAt]);
  const formattedGroupsUpdated = useMemo(() => formatTimestamp(groupsUpdatedAt), [groupsUpdatedAt]);

  const isInteractionDisabled = !!busy;

  const handleMemberSwap = useCallback(
    async (source: string, target: string) => {
      if (!source || !target || source === target) {
        setSelectedAttendee(null);
        setDraggedAttendee(null);
        return;
      }
      try {
        await onSwap(source, target);
      } finally {
        setSelectedAttendee(null);
        setDraggedAttendee(null);
      }
    },
    [onSwap]
  );

  const handleMemberClick = useCallback(
    (name: string) => {
      if (!editMode || isInteractionDisabled) {
        return;
      }
      if (selectedAttendee === name) {
        setSelectedAttendee(null);
        return;
      }
      if (selectedAttendee && selectedAttendee !== name) {
        void handleMemberSwap(selectedAttendee, name);
      } else {
        setSelectedAttendee(name);
      }
    },
    [editMode, handleMemberSwap, isInteractionDisabled, selectedAttendee]
  );

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLButtonElement>, name: string) => {
      if (!editMode || isInteractionDisabled) {
        event.preventDefault();
        return;
      }
      setDraggedAttendee(name);
      setSelectedAttendee(name);
      if (event.dataTransfer) {
        event.dataTransfer.setData("text/plain", name);
        event.dataTransfer.effectAllowed = "move";
      }
    },
    [editMode, isInteractionDisabled]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement | HTMLButtonElement>) => {
      if (!editMode || isInteractionDisabled) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = draggedAttendee ? "move" : "none";
      }
    },
    [draggedAttendee, editMode, isInteractionDisabled]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLButtonElement>, target: string) => {
      if (!editMode || isInteractionDisabled) {
        return;
      }
      event.preventDefault();
      const source = event.dataTransfer?.getData("text/plain") || draggedAttendee;
      if (!source) {
        return;
      }
      void handleMemberSwap(source, target);
    },
    [draggedAttendee, editMode, handleMemberSwap, isInteractionDisabled]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedAttendee(null);
    setSelectedAttendee(null);
  }, []);

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
                  Reload data
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

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-semibold text-slate-800">Attendee roster</h2>
                  <p className="text-sm text-slate-500">
                    {attendees.length} attendee{attendees.length === 1 ? "" : "s"} ready for the next shuffle.
                  </p>
                  <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                    Last updated: {formattedAttendeesUpdated}
                  </span>
                </div>

                {attendees.length ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {attendeePreview.map((attendee, index) => (
                        <span
                          key={`${getDisplayName(attendee, index)}-${index}`}
                          className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                        >
                          {getDisplayName(attendee, index + 1)}
                        </span>
                      ))}
                    </div>
                    {remainingAttendees > 0 && (
                      <div className="text-xs text-slate-500">
                        +{remainingAttendees} more attendee{remainingAttendees === 1 ? "" : "s"} loaded
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    No attendees loaded yet. Pull from Spond or reload saved data to populate the roster.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-semibold text-slate-800">Published groups</h2>
                  <p className="text-sm text-slate-500">
                    {groups.length} active group{groups.length === 1 ? "" : "s"} with {totalGroupMembers} attendee
                    {totalGroupMembers === 1 ? "" : "s"} assigned.
                  </p>
                  <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                    Last updated: {formattedGroupsUpdated}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      Toggle edit mode to drag &amp; drop or click two attendees to swap their assigned groups.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (isInteractionDisabled) {
                          return;
                        }
                        setEditMode((value) => !value);
                        setSelectedAttendee(null);
                        setDraggedAttendee(null);
                      }}
                      disabled={isInteractionDisabled}
                      aria-pressed={editMode}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                        editMode
                          ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                          : "border-slate-300 bg-white text-slate-600 hover:border-emerald-400 hover:text-emerald-600"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <span
                        className={`block h-2 w-2 rounded-full ${editMode ? "bg-emerald-500" : "bg-slate-300"}`}
                      />
                      Edit mode
                    </button>
                  </div>
                  {editMode && (
                    <div className="text-xs font-medium text-emerald-600">
                      {selectedAttendee
                        ? `Select another attendee to swap with ${selectedAttendee}.`
                        : "Select or drag an attendee to start a swap."}
                    </div>
                  )}
                </div>

                {groups.length ? (
                  <div className="mt-4 space-y-3">
                    {groups.map((group) => (
                      <div key={group.group_id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-700">
                          <span>Group {group.group_id}</span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                            {group.members?.length ?? 0} attendee{(group.members?.length ?? 0) === 1 ? "" : "s"}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(group.members ?? []).length ? (
                            group.members!.map((member, index) => {
                              const memberName = getDisplayName(member, index + 1);
                              const isSelected = selectedAttendee === memberName;
                              const isDragging = draggedAttendee === memberName;
                              return (
                                <button
                                  key={`${group.group_id}-${index}`}
                                  type="button"
                                  draggable={editMode && !isInteractionDisabled}
                                  onClick={() => handleMemberClick(memberName)}
                                  onDragStart={(event) => handleDragStart(event, memberName)}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={handleDragOver}
                                  onDrop={(event) => handleDrop(event, memberName)}
                                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs transition ${
                                    editMode
                                      ? "cursor-move border-emerald-200 bg-white text-slate-700 hover:border-emerald-400"
                                      : "border-transparent bg-slate-200 text-slate-700"
                                  } ${
                                    isSelected ? "ring-2 ring-emerald-400" : ""
                                  } ${isDragging ? "opacity-70" : ""}`}
                                  disabled={isInteractionDisabled}
                                >
                                  {memberName}
                                </button>
                              );
                            })
                          ) : (
                            <span className="text-xs text-slate-500">No attendees assigned</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    No published groups found. Shuffle attendees to generate a fresh simulator layout.
                  </div>
                )}
              </section>
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

