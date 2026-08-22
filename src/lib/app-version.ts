/**
 * App version.
 * 1.0.0 — baseline before 2026-07-23
 * 1.1.0 — thermal printer support (ESC/POS + 58/80mm) on checkout & receipts
 * 1.2.0 — transfer orders/lines; reports thermal print + soft filter loading
 * 1.3.0 — purchase requisitions & purchase orders
 * 1.4.0 — goods received notes & GRN lines
 * 1.5.0 — vendor invoices & landed cost allocations
 * 1.5.3 — checkout and management UI/UX refinements
 * 1.5.4 — customer demo profiles and history UI
 * 1.6.0 — receipt redesign (kitchen slip + paid receipt), checkout tablet layout
 * 1.6.1 — required Zod validation for user create/update and tenant update
 * 1.6.2 — user avatar image upload; required Zod validation for system-admin forms
 * 1.7.0 — POS AI helper agent (OpenAI-compatible connection port)
 * 1.8.0 — grouped accordion sidebar; Loli floating assistant; reports & vendors in nav
 */
export const APP_VERSION = "1.8.0";

export const APP_VERSION_LABEL = `v${APP_VERSION}`;
