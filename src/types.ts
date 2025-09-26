export type UnknownRecord = Record<string, any>;

export type Attendee = UnknownRecord; // schema-agnostic

export type Group = {
  group_id: number;
  members: Attendee[];
};

export type ShuffleResponse = {
  sim_count: number;
  total_attendees: number;
  groups: Group[];
};
