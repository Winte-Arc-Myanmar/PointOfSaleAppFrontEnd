"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { apiErrorMessage } from "@/lib/api-error";
import { SystemAdminIssueNotice } from "./SystemAdminIssueNotice";
import { useCustomers } from "@/presentation/hooks/useCustomers";
import { useCardTiers } from "@/presentation/hooks/useCardTiers";
import { useLocations } from "@/presentation/hooks/useLocations";
import { usePosSessions } from "@/presentation/hooks/usePosSessions";
import { usePosRegisters } from "@/presentation/hooks/usePosRegisters";
import { usePaymentMethods } from "@/presentation/hooks/usePaymentMethods";
import { useRegisterMembership } from "@/presentation/hooks/useMembershipMembers";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { CardUidField } from "@/presentation/components/card-reader/CardUidField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import type { CardTier } from "@/core/domain/entities/CardTier";
import { PAYMENT_METHOD_KIND_LABELS } from "@/features/payment-methods/presentation/payment-method-kinds";
import { cn } from "@/lib/utils";

type GuestMode = "new" | "existing";
type CardRow = { cardUid: string; roomNumber: string };
type Errors = Partial<Record<string, string>>;

const newIdempotencyKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

function needsPayment(tier: CardTier | undefined): boolean {
  return Boolean(
    tier && !tier.isPostpaid && tier.preloadAmount > 0 && tier.preloadFunding === "PURCHASED",
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-red-600">{message}</p> : null;
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-border p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-6 items-center justify-center rounded-full bg-mint/20 text-xs">
          {n}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

export function RegisterMembershipForm({
  formId,
  onSuccess,
  onLoadingChange,
  defaultCustomerId,
  defaultTenantId,
}: {
  formId?: string;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  defaultCustomerId?: string;
  defaultTenantId?: string;
}) {
  const { tenantId: lockedTenantId } = usePermissions();
  const tenantId = lockedTenantId ?? defaultTenantId ?? "";
  const toast = useToast();
  const { formatPrice } = useCurrency();
  const registerMembership = useRegisterMembership();

  const { data: tiersData } = useCardTiers({ page: 1, limit: 200 }, { enabled: Boolean(tenantId) });
  const { data: customersData } = useCustomers({ page: 1, limit: 200 });
  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const { data: sessionsData } = usePosSessions({ page: 1, limit: 200 });
  const { data: registersData } = usePosRegisters({ page: 1, limit: 200 });
  const { data: methodsData } = usePaymentMethods({ page: 1, limit: 200 });

  const inTenant = <T extends { tenantId?: string }>(items: T[]) =>
    items.filter((item) => !tenantId || !item.tenantId || String(item.tenantId) === tenantId);

  const tiers = inTenant(tiersData?.items ?? [])
    .filter((t) => t.isActive && !t.deletedAt)
    .sort((a, b) => a.rank - b.rank);
  const customers = inTenant(getPaginatedItems(customersData));
  const locations = inTenant(getPaginatedItems(locationsData)).filter((l) => !l.deletedAt);
  const registers = inTenant(getPaginatedItems(registersData));
  const openSessions = inTenant(getPaginatedItems(sessionsData)).filter(
    (s) => s.status === "OPEN",
  );
  const methods = inTenant(getPaginatedItems(methodsData)).filter((m) => m.isActive);

  const [tierId, setTierId] = useState("");
  const [guestMode, setGuestMode] = useState<GuestMode>(defaultCustomerId ? "existing" : "new");
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? "");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestIdNumber, setGuestIdNumber] = useState("");
  const [cards, setCards] = useState<CardRow[]>([{ cardUid: "", roomNumber: "" }]);
  const [chosenLocationId, setLocationId] = useState("");
  const [chosenPaymentMethodId, setPaymentMethodId] = useState("");
  const [chosenPosSessionId, setPosSessionId] = useState("");
  const [reference, setReference] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [errors, setErrors] = useState<Errors>({});

  const tier = tiers.find((t) => String(t.id) === tierId);
  const payNow = needsPayment(tier);
  const registerLocation = (registerId: string) =>
    registers.find((r) => String(r.id) === String(registerId))?.locationId;

  // Defaults, until the user picks: the only location (or the one with the only open
  // till), that location's only open till, and Cash.
  const openTillLocations = [
    ...new Set(openSessions.map((s) => registerLocation(s.registerId)).filter(Boolean)),
  ];
  const locationId =
    chosenLocationId ||
    (locations.length === 1
      ? String(locations[0].id)
      : openTillLocations.length === 1
        ? String(openTillLocations[0])
        : "");
  const sessionsHere = openSessions.filter((s) => registerLocation(s.registerId) === locationId);
  const posSessionId = sessionsHere.some((s) => String(s.id) === chosenPosSessionId)
    ? chosenPosSessionId
    : sessionsHere.length === 1
      ? String(sessionsHere[0].id)
      : "";
  const paymentMethodId =
    chosenPaymentMethodId ||
    String((methods.find((m) => m.kind === "CASH") ?? methods[0])?.id ?? "");
  const method = methods.find((m) => String(m.id) === paymentMethodId);
  const referenceRequired = method?.kind === "MOBILE_WALLET";
  const showReference =
    method && ["MOBILE_WALLET", "BANK_TRANSFER", "CARD"].includes(method.kind);

  useEffect(() => {
    onLoadingChange?.(registerMembership.isPending);
  }, [registerMembership.isPending, onLoadingChange]);

  const describeTier = (t: CardTier) => {
    const parts: string[] = [];
    if (t.isPostpaid) parts.push("Guest pays everything at the end");
    else if (t.preloadAmount > 0 && t.preloadFunding === "PURCHASED")
      parts.push(`Guest pays ${formatPrice(t.preloadAmount)} up front`);
    else if (t.preloadAmount > 0) parts.push(`Starts with ${formatPrice(t.preloadAmount)} free credit`);
    else parts.push("Starts empty, top up later");
    if (t.discountBps > 0) parts.push(`${t.discountBps / 100}% off`);
    if (t.validityDays > 0) parts.push(`valid ${t.validityDays} days`);
    return parts.join(" · ");
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!tierId) e.tier = tiers.length ? "Choose a card type." : "Create a card type first.";
    if (guestMode === "existing" && !customerId) e.guest = "Choose the guest, or switch to New guest.";
    if (guestMode === "new" && !guestName.trim() && tier?.customerRequirement === "REQUIRED")
      e.guest = "This card type needs the guest's name.";
    if (!locationId) e.location = "Choose where the card is issued.";
    const uids = cards.map((c) => c.cardUid.trim());
    uids.forEach((uid, i) => {
      if (!uid) e[`card-${i}`] = "Tap the card on the reader, or type its number.";
      else if (uids.indexOf(uid) !== i) e[`card-${i}`] = "This card is listed twice.";
    });
    if (payNow) {
      if (!paymentMethodId) e.method = "Choose how the guest pays.";
      if (!posSessionId)
        e.session = sessionsHere.length
          ? "Choose the till taking the money."
          : "No till is open here. Open a POS session first.";
      if (referenceRequired && !reference.trim()) e.reference = "Enter the transaction ID.";
    }
    return e;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !tier) return;

    const customer =
      guestMode === "new" && guestName.trim()
        ? { name: guestName.trim(), ...(guestPhone.trim() ? { phone: guestPhone.trim() } : {}) }
        : undefined;

    registerMembership.mutate(
      {
        tenantId,
        tierId,
        locationId,
        ...(guestMode === "existing" ? { customerId } : {}),
        ...(customer ? { customer } : {}),
        guestIdNumber: guestIdNumber.trim() || undefined,
        cards: cards.map((c, i) => ({
          cardUid: c.cardUid.trim(),
          label: `Guest ${i + 1}`,
          roomNumber: c.roomNumber.trim() || undefined,
        })),
        ...(payNow
          ? {
              posSessionId,
              payment: {
                paymentMethodId,
                amount: tier.preloadAmount,
                reference: reference.trim() || undefined,
              },
            }
          : {}),
        idempotencyKey,
      },
      {
        onSuccess: () => {
          toast.success("Guest card issued.");
          setCards([{ cardUid: "", roomNumber: "" }]);
          setGuestName("");
          setGuestPhone("");
          setGuestIdNumber("");
          setReference("");
          setIdempotencyKey(newIdempotencyKey());
          onSuccess?.();
        },
        onError: (error) =>
          toast.error(apiErrorMessage(error, "Failed to issue the guest card.")),
      },
    );
  };

  const updateCard = (index: number, patch: Partial<CardRow>) =>
    setCards((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <form id={formId} onSubmit={submit} className="space-y-4" noValidate>
      <SystemAdminIssueNotice />

      <Step n={1} title="Card type">
        {tiers.length === 0 ? (
          <p className="text-sm text-muted">
            No card types yet.{" "}
            <Link href="/card-tiers" className="text-mint underline">
              Create one in Card Tiers
            </Link>
            , e.g. &quot;Prepaid&quot;.
          </p>
        ) : (
          <Select value={tierId} onValueChange={setTierId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a card type" />
            </SelectTrigger>
            <SelectContent>
              {tiers.map((t) => (
                <SelectItem key={String(t.id)} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {tier ? <p className="text-sm text-muted">{describeTier(tier)}</p> : null}
        <FieldError message={errors.tier} />
      </Step>

      <Step n={2} title="Guest">
        <div className="inline-flex rounded-lg border border-border p-1 text-sm">
          {(["new", "existing"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setGuestMode(mode)}
              className={cn(
                "rounded-md px-3 py-1.5",
                guestMode === mode ? "bg-mint text-gloss-black" : "text-muted",
              )}
            >
              {mode === "new" ? "New guest" : "Existing customer"}
            </button>
          ))}
        </div>
        {guestMode === "new" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label htmlFor="guestName">
                Name{tier?.customerRequirement === "REQUIRED" ? "" : " (optional)"}
              </Label>
              <Input
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Aung Aung"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="guestPhone">Phone (optional)</Label>
              <Input
                id="guestPhone"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="09 ..."
              />
            </div>
          </div>
        ) : (
          <Select value={customerId} onValueChange={setCustomerId} disabled={Boolean(defaultCustomerId)}>
            <SelectTrigger>
              <SelectValue placeholder={customers.length ? "Choose the customer" : "No customers yet"} />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={String(c.id)} value={String(c.id)}>
                  {c.name}
                  {c.phone ? ` · ${c.phone}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <FieldError message={errors.guest} />
      </Step>

      <Step n={3} title="Card">
        {cards.map((card, index) => (
          <div key={index} className="space-y-1">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px_auto]">
              <CardUidField
                value={card.cardUid}
                onChange={(value) => updateCard(index, { cardUid: value })}
                placeholder="Tap the card or type its number"
              />
              <Input
                value={card.roomNumber}
                onChange={(e) => updateCard(index, { roomNumber: e.target.value })}
                placeholder="Room (optional)"
              />
              {cards.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove this card"
                  onClick={() => setCards((rows) => rows.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>
            <FieldError message={errors[`card-${index}`]} />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCards((rows) => [...rows, { cardUid: "", roomNumber: "" }])}
        >
          <Plus className="size-4" />
          Another card on the same wallet
        </Button>
      </Step>

      <Step n={4} title="Payment">
        {locations.length > 1 || !locationId ? (
          <div className="grid gap-1">
            <Label>Where is the card issued?</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose the location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={String(l.id)} value={String(l.id)}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.location} />
          </div>
        ) : null}

        {!tier ? (
          <p className="text-sm text-muted">Choose a card type to see what the guest pays.</p>
        ) : !payNow ? (
          <p className="text-sm text-muted">
            {tier.isPostpaid
              ? "Nothing to pay now. The guest pays everything at the end."
              : tier.preloadAmount > 0
                ? `Nothing to pay. The card starts with ${formatPrice(tier.preloadAmount)} free credit.`
                : "Nothing to pay now. The card starts empty; top it up later from the wallet page."}
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">
              The guest pays <span className="font-semibold">{formatPrice(tier.preloadAmount)}</span> now.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label>Paid by</Label>
                {methods.length === 0 ? (
                  <p className="text-sm text-muted">
                    No payment methods yet.{" "}
                    <Link href="/payment-methods" className="text-mint underline">
                      Add Cash first
                    </Link>
                    .
                  </p>
                ) : (
                  <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose how the guest pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {methods.map((m) => (
                        <SelectItem key={String(m.id)} value={String(m.id)}>
                          {m.name} ({PAYMENT_METHOD_KIND_LABELS[m.kind].label})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FieldError message={errors.method} />
              </div>
              {showReference ? (
                <div className="grid gap-1">
                  <Label htmlFor="reference">
                    Transaction ID{referenceRequired ? "" : " (optional)"}
                  </Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. KBZ-99182736"
                  />
                  <FieldError message={errors.reference} />
                </div>
              ) : null}
            </div>
            {locationId && sessionsHere.length === 0 ? (
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                No till is open at this location, so the money has nowhere to go.{" "}
                <Link href="/pos-sessions" className="underline">
                  Open a POS session
                </Link>{" "}
                first, then come back.
              </p>
            ) : sessionsHere.length > 1 ? (
              <div className="grid gap-1">
                <Label>Which till takes the money?</Label>
                <Select value={posSessionId} onValueChange={setPosSessionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose the till" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionsHere.map((s) => (
                      <SelectItem key={String(s.id)} value={String(s.id)}>
                        {registers.find((r) => String(r.id) === String(s.registerId))?.name ?? "Till"}
                        {s.openedAt ? ` · opened ${new Date(s.openedAt).toLocaleTimeString()}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : sessionsHere.length === 1 ? (
              <p className="text-sm text-muted">
                Goes into the open till:{" "}
                {registers.find((r) => String(r.id) === String(sessionsHere[0].registerId))?.name ??
                  "Till"}
                .
              </p>
            ) : null}
            {sessionsHere.length !== 0 ? <FieldError message={errors.session} /> : null}
          </div>
        )}
      </Step>

      <details className="rounded-xl border border-border p-4 text-sm">
        <summary className="cursor-pointer font-medium">More options</summary>
        <div className="mt-3 grid gap-1">
          <Label htmlFor="guestIdNumber">Guest ID / passport number (optional)</Label>
          <Input
            id="guestIdNumber"
            value={guestIdNumber}
            onChange={(e) => setGuestIdNumber(e.target.value)}
          />
        </div>
      </details>

      {Object.keys(errors).length > 0 ? (
        <p className="text-sm font-medium text-red-600">Please fix the highlighted items above.</p>
      ) : null}

      {!formId && (
        <Button type="submit" disabled={registerMembership.isPending}>
          {registerMembership.isPending ? "Issuing..." : "Issue card"}
        </Button>
      )}
    </form>
  );
}
