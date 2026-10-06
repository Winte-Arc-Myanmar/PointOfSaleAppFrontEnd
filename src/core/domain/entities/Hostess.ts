/** The KTV room a hostess is in now: shown at the till, not enforced. */
export interface HostessWhereabouts {
  roomId: string;
  roomNumber: string;
  sessionId: string;
  since: string;
  /** When her paid time ends; null for a service sold each. */
  until: string | null;
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
  inRoom: HostessWhereabouts | null;
}

export interface HostessInput {
  name: string;
  nickname?: string;
  phoneNumber?: string;
  isActive?: boolean;
}
