"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Info, UtensilsCrossed, UserRound, Wallet } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import { useDiningZones } from "@/presentation/hooks/useDiningZones";
import { useUsers } from "@/presentation/hooks/useUsers";
import { usePosRegisters } from "@/presentation/hooks/usePosRegisters";
import { usePosSessions } from "@/presentation/hooks/usePosSessions";
import { useSections } from "@/presentation/hooks/useSections";
import { usePaymentMethods } from "@/presentation/hooks/usePaymentMethods";
import { useTaxRates } from "@/presentation/hooks/useTaxRates";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import {
  useAddTableSessionLine,
  useAllocateTableSessionSeat,
  useCheckoutTableSession,
  useRemoveTableSessionSeat,
  useTableSession,
  useTransitionTableSessionState,
} from "@/presentation/hooks/useTableSessions";
import type { TableSessionState } from "@/core/domain/entities/TableSession";

const STATES: TableSessionState[] = [
  "SEATED",
  "ORDERING",
  "SERVED",
  "PAYMENT_PENDING",
  "CLOSED",
];

function getUserLabel(user: any): string {
  return user.fullName || user.username || user.email || String(user.id);
}

export function TableSessionDetail({ sessionId }: { sessionId: string }) {
  const toast = useToast();
  const { data: session, isLoading, error } = useTableSession(sessionId);

  const { data: tablesData } = useDiningTables({ page: 1, limit: 200, sortBy: "tableNumber", sortOrder: "asc" });
  const { data: zonesData } = useDiningZones({ page: 1, limit: 200, sortBy: "sortOrder", sortOrder: "asc" });
  const { data: usersData } = useUsers({ page: 1, limit: 200 });
  const { data: registersData } = usePosRegisters({ page: 1, limit: 200 });
  const { data: posSessionsData } = usePosSessions({ page: 1, limit: 200 });
  const { data: sectionsData } = useSections({ page: 1, limit: 200 });
  const { data: paymentMethodsData } = usePaymentMethods({ page: 1, limit: 200 });
  const { data: taxRatesData } = useTaxRates({ page: 1, limit: 200 });

  const tables = getPaginatedItems(tablesData);
  const zones = getPaginatedItems(zonesData);
  const users = getPaginatedItems(usersData);
  const registers = getPaginatedItems(registersData);
  const posSessions = getPaginatedItems(posSessionsData);
  const sections = getPaginatedItems(sectionsData);
  const paymentMethods = getPaginatedItems(paymentMethodsData);
  const taxRates = getPaginatedItems(taxRatesData);

  const transitionState = useTransitionTableSessionState();
  const addLine = useAddTableSessionLine();
  const allocateSeat = useAllocateTableSessionSeat();
  const removeSeat = useRemoveTableSessionSeat();
  const checkout = useCheckoutTableSession();

  const [stateInput, setStateInput] = useState<TableSessionState>("SEATED");
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("0");
  const [lineDiscount, setLineDiscount] = useState("0");
  const [taxRateId, setTaxRateId] = useState("");
  const [taxAmount, setTaxAmount] = useState("0");
  const [courseType, setCourseType] = useState("");
  const [lineSeatNumber, setLineSeatNumber] = useState("");
  const [salesOrderLineId, setSalesOrderLineId] = useState("");
  const [allocationSeatNumber, setAllocationSeatNumber] = useState("");
  const [allocationId, setAllocationId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("0");
  const [paymentTipAmount, setPaymentTipAmount] = useState("0");
  const [transactionReference, setTransactionReference] = useState("");
  const [serviceCharge, setServiceCharge] = useState("0");
  const [discountReasonId, setDiscountReasonId] = useState("");
  const [totalDiscount, setTotalDiscount] = useState("0");

  const table = useMemo(
    () => (session ? tables.find((item) => String(item.id) === String(session.tableId)) : null),
    [tables, session],
  );
  const zone = useMemo(
    () => (table ? zones.find((item) => String(item.id) === String(table.zoneId)) : null),
    [table, zones],
  );
  const waiter = useMemo(
    () => (session ? users.find((item) => String(item.id) === String(session.waiterId)) : null),
    [session, users],
  );
  const register = useMemo(
    () =>
      session?.posRegisterId
        ? registers.find((item) => String(item.id) === String(session.posRegisterId))
        : null,
    [registers, session?.posRegisterId],
  );
  const openedByPosSession = useMemo(
    () =>
      session?.openedByPosSessionId
        ? posSessions.find((item) => String(item.id) === String(session.openedByPosSessionId))
        : null,
    [posSessions, session?.openedByPosSessionId],
  );
  const relatedSections = useMemo(
    () =>
      session?.tenantId && session?.locationId
        ? sections.filter(
            (section) =>
              section.tenantId === session.tenantId &&
              section.locationId === session.locationId,
          )
        : [],
    [sections, session?.locationId, session?.tenantId],
  );

  const overviewRows = useMemo(
    () =>
      session
        ? [
            { label: "Session ID", value: safeText(session.id), mono: true },
            { label: "State", value: safeText(session.sessionState) },
            { label: "Guest count", value: String(session.guestCount) },
            { label: "Sales order ID", value: safeText(session.salesOrderId || "—"), mono: true },
          ]
        : [],
    [session],
  );

  const relationRows = useMemo(
    () =>
      session
        ? [
            { label: "Dining table", value: table?.tableNumber || safeText(session.tableId) },
            { label: "Dining zone", value: zone?.name || "—" },
            { label: "Waiter", value: waiter ? getUserLabel(waiter) : safeText(session.waiterId) },
            { label: "POS register", value: register?.name || safeText(session.posRegisterId || "—") },
            {
              label: "Opened by POS session",
              value: openedByPosSession
                ? `${String(openedByPosSession.id)} (${openedByPosSession.status})`
                : safeText(session.openedByPosSessionId || "—"),
              mono: !openedByPosSession,
            },
          ]
        : [],
    [openedByPosSession, register, session, table, waiter, zone],
  );

  const recordRows = useMemo(
    () =>
      session
        ? [
            { label: "Tenant ID", value: safeText(session.tenantId), mono: true },
            { label: "Table ID", value: safeText(session.tableId), mono: true },
            { label: "Location ID", value: safeText(session.locationId || "—"), mono: true },
            { label: "Opened at", value: formatDate(session.openedAt ?? undefined) },
            { label: "Closed at", value: session.closedAt ? formatDate(session.closedAt) : "Open" },
          ]
        : [],
    [session],
  );

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading table session..." />;
  if (error || !session) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Table session not found or failed to load.</p>
        <Link href="/table-sessions">
          <Button variant="outline">Back to Table Sessions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/table-sessions"
        backLabel="Table sessions"
        title={`Session ${safeText(session.id)}`}
        editHref={`/table-sessions/${session.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Session overview" icon={ClipboardList}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Dining and staffing" icon={UserRound}>
          <DetailRows rows={relationRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info} className="lg:col-span-2">
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Related sections" icon={UtensilsCrossed}>
        {relatedSections.length === 0 ? (
          <p className="text-sm text-muted">No sections resolved for this tenant/location.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {relatedSections.map((section) => (
              <span
                key={section.id}
                className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs"
              >
                <span
                  className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: section.color || "#9CA3AF" }}
                />
                {section.name}
              </span>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Transition state" icon={ClipboardList}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid gap-2 w-full sm:w-64">
            <Label>Session state</Label>
            <Select value={stateInput} onValueChange={(value) => setStateInput(value as TableSessionState)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            disabled={transitionState.isPending}
            onClick={() =>
              transitionState.mutate(
                { id: sessionId, data: { sessionState: stateInput } },
                {
                  onSuccess: () => toast.success("Session state updated."),
                  onError: () => toast.error("Failed to update session state."),
                },
              )
            }
          >
            {transitionState.isPending ? "Updating..." : "Update state"}
          </Button>
        </div>
      </DetailSection>

      <DetailSection title="Add order line" icon={ClipboardList}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label>Variant ID</Label>
            <Input value={variantId} onChange={(e) => setVariantId(e.target.value)} placeholder="uuid" />
          </div>
          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" min={1} />
          </div>
          <div className="grid gap-2">
            <Label>Unit price</Label>
            <Input value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} type="number" step="0.01" />
          </div>
          <div className="grid gap-2">
            <Label>Line discount</Label>
            <Input value={lineDiscount} onChange={(e) => setLineDiscount(e.target.value)} type="number" step="0.01" />
          </div>
          <div className="grid gap-2">
            <Label>Tax rate</Label>
            <Select value={taxRateId} onValueChange={setTaxRateId}>
              <SelectTrigger>
                <SelectValue placeholder="Optional tax rate" />
              </SelectTrigger>
              <SelectContent>
                {taxRates.map((taxRate) => (
                  <SelectItem key={taxRate.id} value={String(taxRate.id)}>
                    {taxRate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Tax amount</Label>
            <Input value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} type="number" step="0.01" />
          </div>
          <div className="grid gap-2">
            <Label>Course type</Label>
            <Input value={courseType} onChange={(e) => setCourseType(e.target.value)} placeholder="STARTER" />
          </div>
          <div className="grid gap-2">
            <Label>Seat number</Label>
            <Input value={lineSeatNumber} onChange={(e) => setLineSeatNumber(e.target.value)} type="number" min={1} />
          </div>
        </div>
        <div className="pt-3">
          <Button
            type="button"
            disabled={addLine.isPending}
            onClick={() => {
              const qty = Number(quantity);
              const price = Number(unitPrice);
              if (!variantId.trim()) {
                toast.error("Variant ID is required.");
                return;
              }
              if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) {
                toast.error("Enter valid quantity and unit price.");
                return;
              }
              addLine.mutate(
                {
                  id: sessionId,
                  data: {
                    variantId: variantId.trim(),
                    quantity: qty,
                    unitPrice: price,
                    lineDiscount: Number(lineDiscount) || 0,
                    taxRateId: taxRateId || undefined,
                    taxAmount: Number(taxAmount) || 0,
                    courseType: courseType.trim() || undefined,
                    seatNumber: lineSeatNumber ? Number(lineSeatNumber) : undefined,
                  },
                },
                {
                  onSuccess: () => {
                    toast.success("Order line added.");
                    setVariantId("");
                    setQuantity("1");
                    setUnitPrice("0");
                    setLineDiscount("0");
                    setTaxRateId("");
                    setTaxAmount("0");
                    setCourseType("");
                    setLineSeatNumber("");
                  },
                  onError: () => toast.error("Failed to add order line."),
                },
              );
            }}
          >
            {addLine.isPending ? "Adding..." : "Add line"}
          </Button>
        </div>
      </DetailSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Allocate seat" icon={ClipboardList}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Sales order line ID</Label>
              <Input
                value={salesOrderLineId}
                onChange={(e) => setSalesOrderLineId(e.target.value)}
                placeholder="uuid"
              />
            </div>
            <div className="grid gap-2">
              <Label>Seat number</Label>
              <Input
                value={allocationSeatNumber}
                onChange={(e) => setAllocationSeatNumber(e.target.value)}
                type="number"
                min={1}
              />
            </div>
          </div>
          <div className="pt-3">
            <Button
              type="button"
              disabled={allocateSeat.isPending}
              onClick={() => {
                const seat = Number(allocationSeatNumber);
                if (!salesOrderLineId.trim() || !Number.isFinite(seat) || seat <= 0) {
                  toast.error("Enter valid sales order line ID and seat number.");
                  return;
                }
                allocateSeat.mutate(
                  {
                    id: sessionId,
                    data: { salesOrderLineId: salesOrderLineId.trim(), seatNumber: seat },
                  },
                  {
                    onSuccess: () => {
                      toast.success("Seat allocation created.");
                      setSalesOrderLineId("");
                      setAllocationSeatNumber("");
                    },
                    onError: () => toast.error("Failed to allocate seat."),
                  },
                );
              }}
            >
              {allocateSeat.isPending ? "Allocating..." : "Allocate seat"}
            </Button>
          </div>
        </DetailSection>

        <DetailSection title="Remove seat allocation" icon={ClipboardList}>
          <div className="grid gap-2">
            <Label>Allocation ID</Label>
            <Input value={allocationId} onChange={(e) => setAllocationId(e.target.value)} placeholder="uuid" />
          </div>
          <div className="pt-3">
            <Button
              type="button"
              variant="outline"
              disabled={removeSeat.isPending}
              onClick={() => {
                if (!allocationId.trim()) {
                  toast.error("Allocation ID is required.");
                  return;
                }
                removeSeat.mutate(
                  { id: sessionId, allocationId: allocationId.trim() },
                  {
                    onSuccess: () => {
                      toast.success("Seat allocation removed.");
                      setAllocationId("");
                    },
                    onError: () => toast.error("Failed to remove seat allocation."),
                  },
                );
              }}
            >
              {removeSeat.isPending ? "Removing..." : "Remove allocation"}
            </Button>
          </div>
        </DetailSection>
      </div>

      <DetailSection title="Checkout session" icon={Wallet}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label>Payment method</Label>
            <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={String(method.id)}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Amount</Label>
            <Input value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} type="number" step="0.01" />
          </div>
          <div className="grid gap-2">
            <Label>Tip amount</Label>
            <Input value={paymentTipAmount} onChange={(e) => setPaymentTipAmount(e.target.value)} type="number" step="0.01" />
          </div>
          <div className="grid gap-2">
            <Label>Transaction reference</Label>
            <Input value={transactionReference} onChange={(e) => setTransactionReference(e.target.value)} placeholder="TXN-12345" />
          </div>
          <div className="grid gap-2">
            <Label>Service charge</Label>
            <Input value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} type="number" step="0.01" />
          </div>
          <div className="grid gap-2">
            <Label>Total discount</Label>
            <Input value={totalDiscount} onChange={(e) => setTotalDiscount(e.target.value)} type="number" step="0.01" />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Discount reason ID</Label>
            <Input value={discountReasonId} onChange={(e) => setDiscountReasonId(e.target.value)} placeholder="uuid" />
          </div>
        </div>
        <div className="pt-3">
          <Button
            type="button"
            variant="destructive"
            disabled={checkout.isPending}
            onClick={() => {
              const amount = Number(paymentAmount);
              if (!paymentMethodId || !Number.isFinite(amount) || amount <= 0) {
                toast.error("Select payment method and enter a valid amount.");
                return;
              }
              checkout.mutate(
                {
                  id: sessionId,
                  data: {
                    payments: [
                      {
                        paymentMethodId,
                        amount: Number(amount).toFixed(4),
                        tipAmount: Number(paymentTipAmount || 0).toFixed(4),
                        transactionReference: transactionReference.trim() || undefined,
                      },
                    ],
                    tipAmount: Number(paymentTipAmount) || 0,
                    serviceCharge: Number(serviceCharge) || 0,
                    discountReasonId: discountReasonId.trim() || undefined,
                    totalDiscount: Number(totalDiscount) || 0,
                  },
                },
                {
                  onSuccess: () => toast.success("Session checkout completed."),
                  onError: () => toast.error("Failed to checkout session."),
                },
              );
            }}
          >
            {checkout.isPending ? "Checking out..." : "Checkout session"}
          </Button>
        </div>
      </DetailSection>
    </div>
  );
}
