Winterarc POS – Onion Architecture

Winterarc POS is a frontend-only application built with Next.js 16 using the App Router. It implements Onion Architecture to separate concerns across domain, application, infrastructure, and presentation layers, providing a clean and maintainable codebase. The frontend stack includes NextAuth v5 for authentication (handling both credentials and external API-based login), Axios for HTTP communication with the backend, TanStack Query for server state management, react-hook-form with Zod for form handling and validation, and Shadcn UI (Radix + Tailwind) for consistent user interface components.

The folder structure is organized with app/ as the root for routing, layouts, and pages, including login/, products/, and an API route for NextAuth under api/auth/. Middleware handles authentication by redirecting unauthenticated users to /login. Under src/core/, the Onion Architecture is implemented: the domain layer contains entities, value objects, repository and service interfaces, and shared types; the application layer includes DTOs, service implementations, and mappers; the infrastructure layer provides an Axios HTTP client, API-backed repository implementations, and a DI container. Feature-specific modules live under src/features/ (e.g., auth and products), while shared presentation components, hooks, and providers reside under src/presentation/. Server-only configurations, such as NextAuth, are placed under src/server/, and additional libraries are in src/lib/.

The dependency flow is strictly directed: the app/ layer depends on presentation/, which in turn interacts with core/application/services/, and finally accesses core/domain/. Infrastructure implements domain interfaces and is resolved via the DI container; for example, hooks like useProducts obtain services using container.resolve<IProductService>("productService").

A sample feature, Products, demonstrates the layered approach: the domain defines the Product entity along with IProductRepository and IProductService; the application layer contains ProductDto, ProductService, and ProductMapper; the infrastructure layer provides an HTTP client, ApiProductRepository, and DI container bindings; and the presentation layer includes the useProducts hook and UI components such as ProductList and CreateProductForm.

Note on feature organization: feature folders under src/features/ are presentation-only (screens/forms/columns/row actions). The domain, application, and infrastructure layers are centralized under src/core/ and shared across features. This keeps dependency flow consistent and avoids duplicating service/repository implementations per feature.

Environment variables are managed via .env (or a local override like .env.local), and include NEXT_PUBLIC_API_URL for the backend base URL and AUTH_SECRET for NextAuth.

Backend contract (current):
- Auth: POST {API_URL}/v1/auth/signin with body { email, password, type } where type is "system_admin" or "user".
  - When type is "user", tenantId and branchId are also sent.
  - Response is expected to include an access token (e.g. access_token / token / accessToken) plus user/session fields.
- Example resource routes: /v1/products, /v1/customers, /v1/roles, etc. (see src/core/infrastructure/api/constants.ts for the full list).
