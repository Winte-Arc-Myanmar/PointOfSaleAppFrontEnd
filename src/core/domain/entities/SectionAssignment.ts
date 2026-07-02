import type { Id } from "@/core/domain/types";

export interface SectionAssignment {
  id: Id;
  sectionId: string;
  userId: string;
  startsAt: string;
  endsAt?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
