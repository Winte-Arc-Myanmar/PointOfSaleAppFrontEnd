import type { DataTableColumn } from "@/presentation/components/data-table";
import type { AppUser } from "@/core/domain/entities/AppUser";

type UserTableColumnOptions = {
  onView?: (user: AppUser) => void;
  branchNameById?: Map<string, string>;
};

export function getUserTableColumns(
  options: UserTableColumnOptions = {},
): DataTableColumn<AppUser>[] {
  const { onView, branchNameById } = options;

  return [
    {
      key: "fullName",
      header: "Full name",
      sortable: true,
      className: "min-w-[120px] max-w-[200px]",
      render: (u) => (
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={u.fullName}
            onClick={() => onView(u)}
          >
            {u.fullName}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={u.fullName}>
            {u.fullName}
          </span>
        )
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
      key: "branchId",
      header: "Branch",
      className: "min-w-[130px] max-w-[180px]",
      render: (u) => (
        <span className="truncate text-muted" title={u.branchId ? branchNameById?.get(String(u.branchId)) : undefined}>
          {u.branchId ? branchNameById?.get(String(u.branchId)) ?? "Branch unavailable" : "Not assigned"}
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
