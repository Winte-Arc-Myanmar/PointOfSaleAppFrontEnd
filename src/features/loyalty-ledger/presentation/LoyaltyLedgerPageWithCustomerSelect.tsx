"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useCustomers } from "@/presentation/hooks/useCustomers";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { LoyaltyLedgerList } from "./LoyaltyLedgerList";
import { LoyaltyLedgerAllCustomersList } from "./LoyaltyLedgerAllCustomersList";

const CUSTOMER_LIST_LIMIT = 500;
const ALL_CUSTOMERS = "__all__";

export function LoyaltyLedgerPageWithCustomerSelect() {
  const { t } = useLanguage();
  const { data: customers = [], isLoading } = useCustomers({
    page: 1,
    limit: CUSTOMER_LIST_LIMIT,
  });
  const [selectedId, setSelectedId] = useState<string>(ALL_CUSTOMERS);

  const sorted = useMemo(
    () => [...customers].sort((a, b) => a.name.localeCompare(b.name)),
    [customers],
  );

  const customerIds = useMemo(
    () => sorted.map((customer) => String(customer.id)),
    [sorted],
  );

  const isAllMode = selectedId === ALL_CUSTOMERS;

  return (
    <div className="space-y-6">
      <div className="grid max-w-md gap-2">
        <Label htmlFor="customer-select">{t("common.customer")}</Label>
        <Select
          value={selectedId}
          onValueChange={setSelectedId}
          disabled={isLoading}
        >
          <SelectTrigger id="customer-select">
            <SelectValue
              placeholder={
                isLoading ? t("common.loadingCustomers") : t("common.allCustomers")
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CUSTOMERS}>{t("common.allCustomers")}</SelectItem>
            {sorted.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isAllMode ? (
        <LoyaltyLedgerAllCustomersList customerIds={customerIds} />
      ) : (
        <LoyaltyLedgerList
          customerId={selectedId}
          routeBasePath={`/loyalty-ledger/${selectedId}`}
        />
      )}
    </div>
  );
}
