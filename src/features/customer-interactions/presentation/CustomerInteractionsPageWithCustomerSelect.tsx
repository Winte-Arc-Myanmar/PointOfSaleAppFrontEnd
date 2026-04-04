"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useCustomers } from "@/presentation/hooks/useCustomers";
import { CustomerInteractionList } from "./CustomerInteractionList";

const CUSTOMER_LIST_LIMIT = 500;

export function CustomerInteractionsPageWithCustomerSelect() {
  const { data: customers = [], isLoading } = useCustomers({
    page: 1,
    limit: CUSTOMER_LIST_LIMIT,
  });
  const [selectedId, setSelectedId] = useState<string>("");

  const sorted = useMemo(
    () => [...customers].sort((a, b) => a.name.localeCompare(b.name)),
    [customers]
  );

  useEffect(() => {
    if (!selectedId && sorted.length === 1) {
      setSelectedId(String(sorted[0].id));
    }
  }, [sorted, selectedId]);

  return (
    <div className="space-y-6">
      <div className="grid gap-2 max-w-md">
        <Label htmlFor="customer-select-interactions">Customer</Label>
        <Select
          value={selectedId || undefined}
          onValueChange={setSelectedId}
          disabled={isLoading}
        >
          <SelectTrigger id="customer-select-interactions">
            <SelectValue
              placeholder={
                isLoading ? "Loading customers..." : "Select a customer"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {sorted.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted">
          Or open from a{" "}
          <Link
            href="/customers"
            className="text-mint underline-offset-2 hover:underline"
          >
            customer profile
          </Link>
          .
        </p>
      </div>

      {selectedId ? (
        <CustomerInteractionList
          customerId={selectedId}
          routeBasePath={`/customer-interactions/${selectedId}`}
        />
      ) : (
        <p className="text-sm text-muted">
          Choose a customer to view and log interactions.
        </p>
      )}
    </div>
  );
}
