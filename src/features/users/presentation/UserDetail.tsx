"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/presentation/hooks/useUsers";
import { Button } from "@/presentation/components/ui/button";
import { User, Shield, Info } from "lucide-react";
import {
  DetailSection,
  DetailRow,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";

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
      <DetailPageHeader
        backHref="/admin/users"
        backLabel="Users"
        title={safeText(user.fullName)}
        editHref={`/admin/users/${user.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Profile" icon={User}>
          <div className="space-y-0">
            <DetailRow label="User ID" value={safeText(user.id)} mono />
            <DetailRow label="Username" value={safeText(user.username)} />
            <DetailRow label="Full name" value={safeText(user.fullName)} />
            <DetailRow
              label="Email"
              value={
                user.email ? (
                  <a href={`mailto:${user.email}`} className="text-mint hover:underline">
                    {user.email}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <DetailRow label="Phone number" value={safeText(user.phoneNumber)} />
            <DetailRow label="Job title" value={safeText(user.jobTitle)} />
            <DetailRow label="Preferred language" value={safeText(user.preferredLanguage)} />
            {user.avatarUrl && (
              <div className="pt-2">
                <dt className="text-xs font-medium text-muted uppercase tracking-wider">Avatar</dt>
                <dd className="mt-1">
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
          </div>
        </DetailSection>

        <DetailSection title="Status & security" icon={Shield}>
          <div className="space-y-0">
            <DetailRow label="Status" value={safeText(user.status)} />
            <DetailRow label="Login attempts" value={safeText(user.loginAttempts)} />
            <DetailRow label="Last login at" value={formatDate(user.lastLoginAt)} />
            <DetailRow label="Lockout until" value={formatDate(user.lockoutUntil)} />
          </div>
        </DetailSection>

        <DetailSection title="Record info" icon={Info}>
          <div className="space-y-0">
            <DetailRow label="Created at" value={formatDate(user.createdAt)} />
            <DetailRow label="Updated at" value={formatDate(user.updatedAt)} />
          </div>
        </DetailSection>

        {user.metadata != null && Object.keys(user.metadata).length > 0 && (
          <DetailSection title="Metadata" icon={Info} className="lg:col-span-2">
            <pre className="text-xs font-mono text-foreground overflow-auto rounded bg-muted/50 p-3">
              {JSON.stringify(user.metadata, null, 2)}
            </pre>
          </DetailSection>
        )}
      </div>
    </div>
  );
}
