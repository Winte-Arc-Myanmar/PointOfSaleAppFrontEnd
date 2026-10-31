/** The KTV room a hostess is in now: shown at the till, not enforced. */
export interface HostessWhereabouts {
  roomId: string;
  roomNumber: string;
  sessionId: string;
  since: string;
  /** When her paid time ends; null for a service sold each. */
  until: string | null;
}

/** One day of her week: 0 is Sunday. A shift ending at or before it starts runs past midnight. */
export interface HostessShift {
  dayOfWeek: number;
  /** HH:MM, the shop's time. */
  from: string;
  to: string;
}

/** A hostess or dancer called to KTV rooms. Not a user: she never logs in. */
export interface Hostess {
  id: string;
  tenantId: string;
  name: string;
  nickname: string | null;
  phoneNumber: string | null;
  imageUrl: string | null;
  isActive: boolean;
  /** Her own menu commission in basis points; null for the shop default. */
  menuCommissionBps: number | null;
  /** Her week; null when she works whenever she is active. */
  schedule: HostessShift[] | null;
  /** Dates she is off, YYYY-MM-DD: the date her shift starts. */
  daysOff: string[];
  inRoom: HostessWhereabouts | null;
}

export interface HostessInput {
  name: string;
  nickname?: string;
  phoneNumber?: string;
  isActive?: boolean;
  menuCommissionBps?: number | null;
  schedule?: HostessShift[] | null;
  daysOff?: string[];
}
