import type { Customer } from "@/core/domain/entities/Customer";

export type DemoGender = "Female" | "Male" | "Prefer not to say";

export interface DemoSocialAccount {
  platform: "Facebook" | "TikTok";
  username: string;
  url: string;
}

export interface CustomerDemoProfile {
  gender: DemoGender;
  dateOfBirth: string;
  address: string;
  socialAccounts: DemoSocialAccount[];
  tierHistory: {
    tier: "BRONZE" | "SILVER" | "GOLD";
    achievedAt: string;
    reason: string;
  }[];
  orders: {
    orderNumber: string;
    date: string;
    status: "Completed" | "Refunded";
    total: number;
  }[];
  orderActivities: {
    activity: string;
    detail: string;
    date: string;
  }[];
  spendHistory: {
    period: string;
    orderCount: number;
    total: number;
  }[];
}

const GENDERS: DemoGender[] = ["Female", "Male", "Prefer not to say"];
const BIRTH_DATES = [
  "1991-03-14",
  "1995-08-22",
  "1988-11-05",
  "1998-01-30",
  "1993-06-18",
];
const ADDRESSES = [
  "Bahan Township, Yangon",
  "Chanayethazan Township, Mandalay",
  "Taunggyi, Shan State",
  "Mawlamyine, Mon State",
  "Pathein, Ayeyarwady Region",
];

function hashCustomer(customer: Customer): number {
  const source = String(customer.id || customer.name);
  return Array.from(source).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
}

function createUsername(customer: Customer): string {
  const namePart = customer.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  const idPart = String(customer.id).replace(/[^a-z0-9]/gi, "").slice(-4);
  return `${namePart || "customer"}.${idPart || "demo"}`;
}

export function getCustomerDemoProfile(
  customer: Customer,
): CustomerDemoProfile {
  const index = hashCustomer(customer);
  const username = createUsername(customer);
  const amountOffset = (index % 8) * 2500;
  const orderSuffix = String(index).padStart(4, "0").slice(-4);

  return {
    gender: GENDERS[index % GENDERS.length],
    dateOfBirth: BIRTH_DATES[index % BIRTH_DATES.length],
    address: ADDRESSES[index % ADDRESSES.length],
    socialAccounts: [
      {
        platform: "Facebook",
        username,
        url: `https://www.facebook.com/${username}`,
      },
      {
        platform: "TikTok",
        username: `@${username.replaceAll(".", "_")}`,
        url: `https://www.tiktok.com/@${username.replaceAll(".", "_")}`,
      },
    ],
    tierHistory: [
      {
        tier: "GOLD",
        achievedAt: "2026-06-18",
        reason: "Annual spend milestone reached",
      },
      {
        tier: "SILVER",
        achievedAt: "2025-11-02",
        reason: "Loyalty points milestone reached",
      },
      {
        tier: "BRONZE",
        achievedAt: "2025-03-12",
        reason: "Joined the loyalty program",
      },
    ],
    orders: [
      {
        orderNumber: `ORD-${orderSuffix}-03`,
        date: "2026-07-24",
        status: "Completed",
        total: 128500 + amountOffset,
      },
      {
        orderNumber: `ORD-${orderSuffix}-02`,
        date: "2026-06-18",
        status: "Completed",
        total: 86250 + amountOffset,
      },
      {
        orderNumber: `ORD-${orderSuffix}-01`,
        date: "2026-05-09",
        status: index % 4 === 0 ? "Refunded" : "Completed",
        total: 54750 + amountOffset,
      },
    ],
    orderActivities: [
      {
        activity: "Order completed",
        detail: `Order ORD-${orderSuffix}-03 was paid in full`,
        date: "2026-07-24 14:32",
      },
      {
        activity: "Loyalty points earned",
        detail: "128 points added to the customer account",
        date: "2026-07-24 14:33",
      },
      {
        activity: "Order created",
        detail: `Order ORD-${orderSuffix}-03 was created at checkout`,
        date: "2026-07-24 14:21",
      },
    ],
    spendHistory: [
      { period: "July 2026", orderCount: 2, total: 128500 + amountOffset },
      { period: "June 2026", orderCount: 1, total: 86250 + amountOffset },
      { period: "May 2026", orderCount: 1, total: 54750 + amountOffset },
      { period: "April 2026", orderCount: 2, total: 97500 + amountOffset },
    ],
  };
}

export function calculateAge(dateOfBirth: string, today = new Date()): number {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasNotHadBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());

  if (hasNotHadBirthday) age -= 1;
  return age;
}
