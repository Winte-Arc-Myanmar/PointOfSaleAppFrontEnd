import type { AgentTool } from "@/core/domain/entities/AiAgent";
import type { IAgentToolExecutor } from "@/core/domain/services/IAgentToolExecutor";

interface PosModuleHelp {
  id: string;
  title: string;
  href: string;
  summary: string;
  steps: string[];
  aliases: string[];
}

const POS_MODULES: PosModuleHelp[] = [
  {
    id: "checkout",
    title: "Checkout",
    href: "/checkout",
    summary: "Ring up items, take payment, and print the kitchen slip or paid receipt.",
    steps: [
      "Open Checkout from the menu.",
      "Add products to the cart and confirm quantities.",
      "Choose the customer if needed, then take payment.",
      "Print the kitchen/pre-pay slip or the paid receipt.",
    ],
    aliases: ["pos", "sale", "register", "cart", "payment"],
  },
  {
    id: "refunds",
    title: "Refunds",
    href: "/refunds",
    summary: "Issue a refund against a completed sales order.",
    steps: [
      "Open Refunds.",
      "Find the original order.",
      "Enter the refund amount and reason, then submit.",
    ],
    aliases: ["return", "money back"],
  },
  {
    id: "products",
    title: "Products",
    href: "/products",
    summary: "Create and maintain items, prices, and product images.",
    steps: [
      "Open Products.",
      "Create or edit an item, including SKU and price.",
      "Attach an image from the product image library if needed.",
    ],
    aliases: ["item", "menu", "sku"],
  },
  {
    id: "users",
    title: "Users",
    href: "/users",
    summary: "Create staff accounts, roles, and avatars.",
    steps: [
      "Open Users.",
      "Create a user with email, username, role, branch, and phone.",
      "Upload an avatar instead of pasting a URL.",
    ],
    aliases: ["staff", "account", "avatar"],
  },
  {
    id: "goods-received-notes",
    title: "Goods received notes",
    href: "/goods-received-notes",
    summary: "Record stock received from a purchase order.",
    steps: [
      "Open Goods Received Notes.",
      "Create a GRN against the vendor/PO.",
      "Enter line quantities, then continue to vendor invoices if needed.",
    ],
    aliases: ["grn", "receiving", "stock in"],
  },
  {
    id: "purchase-orders",
    title: "Purchase orders",
    href: "/purchase-orders",
    summary: "Order stock from vendors.",
    steps: [
      "Open Purchase Orders (or start from a purchase requisition).",
      "Add lines and send the PO to the vendor.",
      "Receive stock later on a goods received note.",
    ],
    aliases: ["po", "buying", "vendor order"],
  },
  {
    id: "reports",
    title: "Reports",
    href: "/reports",
    summary: "View daily sales, item mix, and Z-report, then print thermally if needed.",
    steps: [
      "Open Reports and pick a date range and location.",
      "Review daily sales, category, item, and hour breakdowns.",
      "Print a Z-report from the same screen when closing.",
    ],
    aliases: ["sales report", "z-report", "z report"],
  },
  {
    id: "inventory-ledger",
    title: "Inventory ledger",
    href: "/inventory-ledger",
    summary: "See stock movements and balances by location.",
    steps: [
      "Open Inventory ledger.",
      "Filter by location or variant.",
      "Use write-off only when you have permission.",
    ],
    aliases: ["stock", "on hand", "inventory"],
  },
];

function parseArgs(argumentsJson: string): Record<string, unknown> {
  if (!argumentsJson.trim()) return {};
  try {
    const parsed = JSON.parse(argumentsJson) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function findModule(topic: string): PosModuleHelp | undefined {
  const q = topic.trim().toLowerCase();
  if (!q) return undefined;
  return POS_MODULES.find((module) => {
    if (module.id === q || module.title.toLowerCase() === q) return true;
    return module.aliases.some((alias) => q.includes(alias) || alias.includes(q));
  });
}

export class PosHelperToolExecutor implements IAgentToolExecutor {
  listTools(): AgentTool[] {
    return [
      {
        type: "function",
        function: {
          name: "list_modules",
          description:
            "List POS screens the staff member can open, with route and a one-line summary.",
          parameters: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_howto",
          description:
            "Get short how-to steps for a POS task such as checkout, refunds, GRN, users, or reports.",
          parameters: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description: "Module or task name, e.g. checkout, refunds, GRN.",
              },
            },
            required: ["topic"],
            additionalProperties: false,
          },
        },
      },
    ];
  }

  async execute(name: string, argumentsJson: string): Promise<string> {
    if (name === "list_modules") {
      return JSON.stringify(
        POS_MODULES.map((module) => ({
          id: module.id,
          title: module.title,
          href: module.href,
          summary: module.summary,
        })),
      );
    }

    if (name === "get_howto") {
      const topic = String(parseArgs(argumentsJson).topic ?? "");
      const module = findModule(topic);
      if (!module) {
        return JSON.stringify({
          found: false,
          message: `No how-to for "${topic}". Try checkout, refunds, products, users, GRN, purchase orders, reports, or inventory.`,
        });
      }
      return JSON.stringify({
        found: true,
        title: module.title,
        href: module.href,
        summary: module.summary,
        steps: module.steps,
      });
    }

    return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
