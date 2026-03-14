import type { DataTableColumn } from "@/presentation/components/data-table";
import type { AppUser } from "@/core/domain/entities/AppUser";

export function getUserTableColumns(): DataTableColumn<AppUser>[] {
  return [
    {
      key: "fullName",
      header: "Full name",
      sortable: true,
      className: "min-w-[120px] max-w-[200px]",
      render: (u) => (
        <span className="font-medium text-foreground truncate" title={u.fullName}>
          {u.fullName}
        </span>
      ),
    },
    {
      key: "username",
      header: "Username",
      className: "min-w-[100px] max-w-[160px]",
      render: (u) => (
        <span className="text-muted truncate" title={u.username}>
          {u.username}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "min-w-[160px] max-w-[240px]",
      render: (u) => (
        <span className="text-muted truncate" title={u.email}>
          {u.email}
        </span>
      ),
    },
    {
      key: "jobTitle",
      header: "Job title",
      className: "min-w-[100px] max-w-[160px]",
      render: (u) => (
        <span className="text-muted">{u.jobTitle ?? "—"}</span>
      ),
    },
    {
      key: "phoneNumber",
      header: "Phone",
      className: "min-w-[120px] max-w-[160px]",
      render: (u) => (
        <span className="text-muted">{u.phoneNumber ?? "—"}</span>
      ),
    },
  ];
}
