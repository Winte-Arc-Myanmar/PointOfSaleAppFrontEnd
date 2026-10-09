"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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
import { useProducts } from "@/presentation/hooks/useProducts";
import { useProductVariants } from "@/presentation/hooks/useProductVariants";
import type { SpaPackage, SpaPackageInput, SpaPackageItem } from "@/core/domain/entities/Spa";

const HIDDEN_CATEGORIES = ["Spa Packages", "Spa Rooms", "KTV Rooms", "Private VIP Lounges"];

type Errors = Partial<Record<"name" | "durationMinutes" | "price", string>>;

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-sm text-red-600">{message}</p> : null;

function AddItem({ onAdd }: { onAdd: (item: SpaPackageItem) => void }) {
  const { data: productsData } = useProducts({ page: 1, limit: 500 });
  const products = (productsData?.items ?? []).filter(
    (p) => !HIDDEN_CATEGORIES.includes(p.categoryName ?? ""),
  );
  const [productId, setProductId] = useState("");
  const [chosenVariantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const { data: variantsData } = useProductVariants(productId || null, { page: 1, limit: 50 });
  const variants = variantsData?.items ?? [];
  const variantId = chosenVariantId || (variants.length === 1 ? String(variants[0].id) : "");
  const product = products.find((p) => String(p.id) === productId);

  const add = () => {
    if (!product || !variantId) return;
    const variant = variants.find((v) => String(v.id) === variantId);
    const options = variant ? Object.values(variant.matrixOptions ?? {}).join(" / ") : "";
    onAdd({
      variantId,
      name: options ? `${product.name} (${options})` : product.name,
      quantity: Math.max(1, Math.round(Number(quantity) || 1)),
    });
    setProductId("");
    setVariantId("");
    setQuantity("1");
  };

  return (
    <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_1fr_80px_auto]">
      <div className="grid gap-1">
        <Label>Menu item</Label>
        <Select
          value={productId}
          onValueChange={(v) => {
            if (!v) return;
            setProductId(v);
            setVariantId("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose an item" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={String(p.id)} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1">
        <Label>Option</Label>
        {variants.length > 1 ? (
          <Select value={variantId} onValueChange={(v) => v && setVariantId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((v) => (
                <SelectItem key={String(v.id)} value={String(v.id)}>
                  {Object.values(v.matrixOptions ?? {}).join(" / ") || v.variantSku}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="py-2 text-sm text-muted">{productId ? "Standard" : "—"}</p>
        )}
      </div>
      <div className="grid gap-1">
        <Label>Qty</Label>
        <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </div>
      <Button type="button" variant="outline" onClick={add} disabled={!product || !variantId}>
        Add
      </Button>
    </div>
  );
}

export function SpaPackageForm({
  formId,
  pkg,
  onSubmit,
}: {
  formId: string;
  pkg?: SpaPackage;
  onSubmit: (data: SpaPackageInput) => void;
}) {
  const [name, setName] = useState(pkg?.name ?? "");
  const [description, setDescription] = useState(pkg?.description ?? "");
  const [duration, setDuration] = useState(pkg ? String(pkg.durationMinutes) : "60");
  const [price, setPrice] = useState(pkg ? String(pkg.price) : "");
  const [isActive, setIsActive] = useState(pkg?.isActive ?? true);
  const [items, setItems] = useState<SpaPackageItem[]>(pkg?.items ?? []);
  const [errors, setErrors] = useState<Errors>({});

  const addItem = (item: SpaPackageItem) =>
    setItems((current) => {
      const existing = current.find((i) => i.variantId === item.variantId);
      return existing
        ? current.map((i) =>
            i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i,
          )
        : [...current, item];
    });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const e: Errors = {};
    if (!name.trim()) e.name = "Give the package a name, e.g. Thai massage 90 min.";
    if (!(Number(duration) >= 1)) e.durationMinutes = "How long does it take? At least 1 minute.";
    if (price.trim() === "" || !(Number(price) >= 0)) e.price = "Enter what the guest pays.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      durationMinutes: Math.round(Number(duration)),
      price: Number(price),
      isActive,
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    });
  };

  return (
    <form id={formId} onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-1">
        <Label htmlFor="pkg-name">Package name</Label>
        <Input id="pkg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Thai massage 90 min" />
        <FieldError message={errors.name} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label htmlFor="pkg-duration">How long</Label>
          <div className="flex items-center gap-2">
            <Input id="pkg-duration" type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} />
            <span className="text-sm text-muted">min</span>
          </div>
          <FieldError message={errors.durationMinutes} />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="pkg-price">Price</Label>
          <Input id="pkg-price" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 45000" />
          <FieldError message={errors.price} />
        </div>
      </div>
      <div className="grid gap-1">
        <Label htmlFor="pkg-description">Description (optional)</Label>
        <Input id="pkg-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Full body, with hot compress" />
      </div>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <div>
          <p className="text-sm font-medium">Included in the price (optional)</p>
          <p className="text-xs text-muted">
            Food or drinks that come with the package, e.g. a juice. They go to the kitchen when the
            package is sold, at no extra charge.
          </p>
        </div>
        {items.length ? (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {items.map((item) => (
              <li key={item.variantId} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => setItems((current) => current.filter((i) => i.variantId !== item.variantId))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        <AddItem onAdd={addItem} />
      </section>

      <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
        <span>
          <span className="block text-sm font-medium">On sale</span>
          <span className="block text-xs text-muted">Turn off to stop selling it without deleting it.</span>
        </span>
        <input type="checkbox" className="size-5" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
      </label>
    </form>
  );
}
