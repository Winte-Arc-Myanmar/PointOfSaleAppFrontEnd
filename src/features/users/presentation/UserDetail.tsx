"use client";

import Link from "next/link";
import { useUser } from "@/presentation/hooks/useUsers";
import { Button } from "@/presentation/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function UserDetail({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <p className="text-muted">Loading user...</p>;
  if (error || !user)
    return (
      <div className="space-y-4">
        <p className="text-red-500">User not found or failed to load.</p>
        <Link href="/admin/users">
          <Button variant="outline">Back to Users</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon" aria-label="Back to users">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-foreground">{user.fullName}</h1>
        <Link href={`/admin/users/${user.id}/edit`}>
          <Button>Edit</Button>
        </Link>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted">Username</dt>
          <dd className="font-medium">{user.username}</dd>
        </div>
        <div>
          <dt className="text-muted">Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt className="text-muted">Phone</dt>
          <dd>{user.phoneNumber ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Job title</dt>
          <dd>{user.jobTitle ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Preferred language</dt>
          <dd>{user.preferredLanguage ?? "—"}</dd>
        </div>
        {user.avatarUrl && (
          <div className="sm:col-span-2">
            <dt className="text-muted">Avatar</dt>
            <dd>
              <a
                href={user.avatarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mint hover:underline"
              >
                {user.avatarUrl}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
