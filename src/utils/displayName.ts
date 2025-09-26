import type { Attendee } from "../types";

export const getDisplayName = (person: Attendee, fallbackIndex: number) => {
  if (person == null) {
    return `Attendee ${fallbackIndex}`;
  }

  if (typeof person === "string" || typeof person === "number") {
    return String(person);
  }

  const record = person as Record<string, unknown>;
  const primaryKeys = ["name", "full_name", "fullName", "display_name", "displayName"] as const;

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
