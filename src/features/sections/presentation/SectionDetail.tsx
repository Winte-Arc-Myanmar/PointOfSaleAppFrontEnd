"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Grid2X2, Info, Layers3, UserRound } from "lucide-react";
import { useSection, useAttachDiningTableToSection, useDetachDiningTableFromSection, useSectionAssignments, useCreateSectionAssignment, useEndSectionAssignment } from "@/presentation/hooks/useSections";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import { useUsers } from "@/presentation/hooks/useUsers";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { AppLoader } from "@/presentation/components/loader";
import { DetailPageHeader, DetailRows, DetailSection, formatDate, safeText } from "@/presentation/components/detail";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

export function SectionDetail({ sectionId }: { sectionId: string }) {
  const toast = useToast();
  const { data: section, isLoading, error } = useSection(sectionId);
  const { data: assignments = [], isLoading: assignmentsLoading } = useSectionAssignments(sectionId);
  const { data: usersResult } = useUsers({ page: 1, limit: 200 });
  const { data: diningTablesResult } = useDiningTables({ page: 1, limit: 200 });
  const users = getPaginatedItems(usersResult);
  const diningTables = getPaginatedItems(diningTablesResult);

  const attachTable = useAttachDiningTableToSection();
  const detachTable = useDetachDiningTableFromSection();
  const createAssignment = useCreateSectionAssignment();
  const endAssignment = useEndSectionAssignment();

  const [tableId, setTableId] = useState("");
  const [detachTableId, setDetachTableId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");

  const rows = useMemo(
    () =>
      section
        ? [
            { label: "Section ID", value: safeText(section.id), mono: true },
            { label: "Name", value: safeText(section.name) },
            {
              label: "Color",
              value: (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-border"
                    style={{ backgroundColor: section.color }}
                  />
                  <span className="font-mono text-xs">{section.color}</span>
                </span>
              ),
            },
            { label: "Location ID", value: safeText(section.locationId), mono: true },
            { label: "Tenant ID", value: safeText(section.tenantId), mono: true },
          ]
        : [],
    [section]
  );

  const recordRows = useMemo(
    () =>
      section
        ? [
            { label: "Created at", value: formatDate(section.createdAt ?? undefined) },
            { label: "Updated at", value: formatDate(section.updatedAt ?? undefined) },
          ]
        : [],
    [section]
  );

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading section..." />;
  if (error || !section) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Section not found or failed to load.</p>
        <Link href="/sections">
          <Button variant="outline">Back to Sections</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/sections"
        backLabel="Sections"
        title={safeText(section.name)}
        editHref={`/sections/${section.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Section overview" icon={Layers3}>
          <DetailRows rows={rows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Table attachment" icon={Grid2X2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Attach table</p>
            <Select value={tableId} onValueChange={setTableId}>
              <SelectTrigger>
                <SelectValue placeholder="Select dining table" />
              </SelectTrigger>
              <SelectContent>
                {diningTables.map((table) => (
                  <SelectItem key={table.id} value={String(table.id)}>
                    {table.tableNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!tableId || attachTable.isPending}
              onClick={() =>
                attachTable.mutate(
                  { sectionId, tableId },
                  {
                    onSuccess: () => {
                      toast.success("Table attached to section.");
                      setTableId("");
                    },
                    onError: () => toast.error("Failed to attach table."),
                  }
                )
              }
            >
              Attach table
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Detach table</p>
            <Select value={detachTableId} onValueChange={setDetachTableId}>
              <SelectTrigger>
                <SelectValue placeholder="Select dining table" />
              </SelectTrigger>
              <SelectContent>
                {diningTables.map((table) => (
                  <SelectItem key={table.id} value={String(table.id)}>
                    {table.tableNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              disabled={!detachTableId || detachTable.isPending}
              onClick={() =>
                detachTable.mutate(
                  { sectionId, tableId: detachTableId },
                  {
                    onSuccess: () => {
                      toast.success("Table detached from section.");
                      setDetachTableId("");
                    },
                    onError: () => toast.error("Failed to detach table."),
                  }
                )
              }
            >
              Detach table
            </Button>
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Waiter assignments" icon={UserRound}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select value={assignedUserId} onValueChange={setAssignedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select waiter/user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.fullName || user.username || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              placeholder="Starts at"
            />
            <Input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              placeholder="Ends at (optional)"
            />
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
            />
          </div>
          <Button
            size="sm"
            disabled={!assignedUserId || !startsAt || createAssignment.isPending}
            onClick={() =>
              createAssignment.mutate(
                {
                  sectionId,
                  data: {
                    userId: assignedUserId,
                    startsAt: new Date(startsAt).toISOString(),
                    endsAt: endsAt ? new Date(endsAt).toISOString() : null,
                    notes: notes || null,
                  },
                },
                {
                  onSuccess: () => {
                    toast.success("Assignment created.");
                    setAssignedUserId("");
                    setStartsAt("");
                    setEndsAt("");
                    setNotes("");
                  },
                  onError: () => toast.error("Failed to create assignment."),
                }
              )
            }
          >
            Create assignment
          </Button>

          {assignmentsLoading ? (
            <AppLoader fullScreen={false} size="sm" message="Loading assignments..." />
          ) : assignments.length === 0 ? (
            <p className="text-sm text-muted">No assignments for this section yet.</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-lg border border-border px-3 py-2 flex items-center justify-between gap-3"
                >
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      User: <span className="font-mono">{assignment.userId}</span>
                    </p>
                    <p className="text-muted">
                      {formatDate(assignment.startsAt)} -{" "}
                      {assignment.endsAt ? formatDate(assignment.endsAt) : "Active"}
                    </p>
                    {assignment.notes && (
                      <p className="text-xs text-muted mt-1">{assignment.notes}</p>
                    )}
                  </div>
                  {!assignment.endsAt && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={endAssignment.isPending}
                      onClick={() =>
                        endAssignment.mutate(
                          { sectionId, assignmentId: String(assignment.id) },
                          {
                            onSuccess: () => toast.success("Assignment ended."),
                            onError: () => toast.error("Failed to end assignment."),
                          }
                        )
                      }
                    >
                      End now
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DetailSection>
    </div>
  );
}
