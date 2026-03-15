"use client";

import Link from "next/link";
import Image from "next/image";
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
        <h1 className="panel-header text-xl tracking-tight text-foreground">
          {user.fullName}
        </h1>
        <Link href={`/admin/users/${user.id}/edit`}>
          <Button>Edit</Button>
        </Link>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted">User ID</dt>
          <dd className="font-mono text-xs">{user.id}</dd>
        </div>
        <div>
          <dt className="text-muted">Username</dt>
          <dd className="font-medium">{user.username}</dd>
        </div>
        <div>
          <dt className="text-muted">Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt className="text-muted">Full name</dt>
          <dd>{user.fullName}</dd>
        </div>
        <div>
          <dt className="text-muted">Phone number</dt>
          <dd>{user.phoneNumber ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Job title</dt>
          <dd>{user.jobTitle ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Status</dt>
          <dd>{user.status ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Preferred language</dt>
          <dd>{user.preferredLanguage ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Login attempts</dt>
          <dd>{user.loginAttempts ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Last login at</dt>
          <dd className="text-muted">{user.lastLoginAt ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Lockout until</dt>
          <dd className="text-muted">{user.lockoutUntil ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Created at</dt>
          <dd className="text-muted">{user.createdAt ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Updated at</dt>
          <dd className="text-muted">{user.updatedAt ?? "—"}</dd>
        </div>
        {user.avatarUrl && (
          <div className="sm:col-span-2">
            <dt className="text-muted">Avatar</dt>
            <dd>
              <Image
                src={user.avatarUrl}
                alt={`${user.fullName} avatar`}
                width={80}
                height={80}
                className="rounded-full object-cover h-20 w-20"
                unoptimized
              />
            </dd>
          </div>
        )}
        {user.metadata != null && Object.keys(user.metadata).length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-muted">Metadata</dt>
            <dd className="font-mono text-xs break-all">
              {JSON.stringify(user.metadata)}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
