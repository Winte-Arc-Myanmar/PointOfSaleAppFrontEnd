"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { DetailSection } from "@/presentation/components/detail";
import { useToast } from "@/presentation/providers/ToastProvider";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useChangeTableSeating, useTableSessions } from "@/presentation/hooks/useTableSessions";
import { apiErrorMessage } from "@/lib/api-error";
import type { DiningTable } from "@/core/domain/entities/DiningTable";
import type { TableSession } from "@/core/domain/entities/TableSession";
import type { TableSeatingChangeDto } from "@/core/application/dtos/TableSessionDto";

export function TableSeatingSection({
  session,
  tables,
}: {
  session: TableSession;
  tables: DiningTable[];
}) {
  const toast = useToast();
  const changeSeating = useChangeTableSeating();
  const { data: openData } = useTableSessions({ page: 1, limit: 200, openOnly: true });

  const [moveTableId, setMoveTableId] = useState("");
  const [joinTableId, setJoinTableId] = useState("");
  const [sourceSessionId, setSourceSessionId] = useState("");
  const [keepTable, setKeepTable] = useState(false);

  const tableNumber = (tableId: string) =>
    tables.find((table) => String(table.id) === tableId)?.tableNumber || tableId;
  const ownTableIds = [session.tableId, ...session.joinedTableIds];
  const freeTables = tables.filter(
    (table) => !ownTableIds.includes(String(table.id)) && table.status !== "OCCUPIED",
  );
  const otherSessions = useMemo(
    () =>
      getPaginatedItems(openData).filter(
        (other) => String(other.id) !== String(session.id) && !other.closedAt,
      ),
    [openData, session.id],
  );

  const run = (change: TableSeatingChangeDto, done: string, reset: () => void) =>
    changeSeating.mutate(
      { id: String(session.id), change },
      {
        onSuccess: () => {
          toast.success(done);
          reset();
        },
        onError: (err) => toast.error(apiErrorMessage(err, "Could not change the table.")),
      },
    );

  const busy = changeSeating.isPending;

  return (
    <DetailSection title="Change table and combine" icon={ArrowLeftRight}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="grid content-start gap-2">
          <Label>Change table</Label>
          <p className="text-xs text-muted">
            The guests and their bill move to a free table. The old table is marked dirty.
          </p>
          <Select value={moveTableId} onValueChange={setMoveTableId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a free table" />
            </SelectTrigger>
            <SelectContent>
              {freeTables.map((table) => (
                <SelectItem key={table.id} value={String(table.id)}>
                  {table.tableNumber} ({table.maxSeats} seats)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            disabled={busy || !moveTableId}
            onClick={() =>
              run(
                { kind: "move", tableId: moveTableId },
                `Moved to table ${tableNumber(moveTableId)}.`,
                () => setMoveTableId(""),
              )
            }
          >
            Move
          </Button>
        </div>

        <div className="grid content-start gap-2">
          <Label>Combine another table&apos;s bill</Label>
          <p className="text-xs text-muted">
            Its items, kitchen tickets and guests come onto this bill, and its session closes.
          </p>
          <Select value={sourceSessionId} onValueChange={setSourceSessionId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an open table" />
            </SelectTrigger>
            <SelectContent>
              {otherSessions.map((other) => (
                <SelectItem key={other.id} value={String(other.id)}>
                  {[other.tableId, ...other.joinedTableIds].map(tableNumber).join(" + ")} (
                  {other.guestCount} guests)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={keepTable}
              onChange={(event) => setKeepTable(event.target.checked)}
            />
            Keep both tables for one party
          </label>
          <Button
            type="button"
            disabled={busy || !sourceSessionId}
            onClick={() =>
              run(
                { kind: "merge", sourceSessionId, keepTable },
                "Bills combined.",
                () => {
                  setSourceSessionId("");
                  setKeepTable(false);
                },
              )
            }
          >
            Combine bills
          </Button>
        </div>

        <div className="grid content-start gap-2">
          <Label>Join a free table</Label>
          <p className="text-xs text-muted">
            Push a free table together with this one: same party, one bill.
          </p>
          <Select value={joinTableId} onValueChange={setJoinTableId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a free table" />
            </SelectTrigger>
            <SelectContent>
              {freeTables.map((table) => (
                <SelectItem key={table.id} value={String(table.id)}>
                  {table.tableNumber} ({table.maxSeats} seats)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            disabled={busy || !joinTableId}
            onClick={() =>
              run(
                { kind: "join", tableId: joinTableId },
                `Table ${tableNumber(joinTableId)} joined.`,
                () => setJoinTableId(""),
              )
            }
          >
            Join table
          </Button>
          {session.joinedTableIds.length ? (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
              <span className="text-muted">Joined:</span>
              {session.joinedTableIds.map((tableId) => (
                <Button
                  key={tableId}
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    run(
                      { kind: "release", tableId },
                      `Table ${tableNumber(tableId)} released.`,
                      () => undefined,
                    )
                  }
                >
                  Release {tableNumber(tableId)}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </DetailSection>
  );
}
