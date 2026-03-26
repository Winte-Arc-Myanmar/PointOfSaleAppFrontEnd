"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/presentation/hooks/useUsers";
import { Button } from "@/presentation/components/ui/button";
import { User, Shield, Info } from "lucide-react";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function UserDetail({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId);
  const profileRows = user
    ? [
        { label: "User ID", value: safeText(user.id), mono: true },
        { label: "Username", value: safeText(user.username) },
        { label: "Full name", value: safeText(user.fullName) },
        {
          label: "Email",
          value: user.email ? (
            <a href={`mailto:${user.email}`} className="text-mint hover:underline">
              {user.email}
            </a>
          ) : (
            "—"
          ),
        },
        { label: "Phone number", value: safeText(user.phoneNumber) },
        { label: "Job title", value: safeText(user.jobTitle) },
        { label: "Preferred language", value: safeText(user.preferredLanguage) },
      ]
    : [];
  const statusRows = user
    ? [
        { label: "Status", value: safeText(user.status) },
        { label: "Login attempts", value: safeText(user.loginAttempts) },
        { label: "Last login at", value: formatDate(user.lastLoginAt) },
        { label: "Lockout until", value: formatDate(user.lockoutUntil) },
      ]
    : [];
  const recordRows = user
    ? [
        { label: "Created at", value: formatDate(user.createdAt) },
        { label: "Updated at", value: formatDate(user.updatedAt) },
      ]
    : [];

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading user..." />;
  if (error || !user)
    return (
      <div className="space-y-4">
        <p className="text-red-500">User not found or failed to load.</p>
        <Link href="/users">
          <Button variant="outline">Back to Users</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/users"
        backLabel="Users"
        title={safeText(user.fullName)}
        editHref={`/users/${user.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Profile" icon={User}>
          <div className="space-y-0">
            <DetailRows rows={profileRows} />
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
          <DetailRows rows={statusRows} />
        </DetailSection>

        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
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
