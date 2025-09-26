
import type { Attendee, Group, ShuffleResponse } from "../types";

const DEFAULT_BASE = "https://bsi-golf-api.vercel.app/";

export class ApiClient {
  baseUrl: string;
  constructor(baseUrl = DEFAULT_BASE) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, "");
  }

  private async req<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`${res.status} ${res.statusText} – ${text}`);
    }
    return res.json() as Promise<T>;
  }

  health() {
    return this.req<{ message: string }>("/");
  }

  pullFromSpond() {
    return this.req<Attendee[]>("/attendeesFromSpond");
  }

  getAttendees() {
    return this.req<Attendee[]>("/attendees/");
  }

  shuffle(simCount: number) {
    const qs = new URLSearchParams({ sim_count: String(simCount) }).toString();
    return this.req<ShuffleResponse>(`/groups/shuffle?${qs}`, { method: "POST" });
  }

  getGroups() {
    return this.req<Group[]>("/groups/");
  }
}

export const api = new ApiClient();
