"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  approveFoundingCreatorAction,
  rejectFoundingCreatorAction,
} from "@/lib/actions/founding-creator.actions"
import type { FoundingCreatorStatus } from "@/lib/founding-creator/constants"

export type AdminApplicationRow = {
  userId: string
  status: FoundingCreatorStatus
  appliedAt: string | null
  grantedAt: string | null
  expiresAt: string | null
  rejectReason: string | null
  plan: string | null
  stripeStatus: string | null
  name: string
  username: string
  email: string
  avatar: string
  bio: string
}

export function FoundingAdminClient({
  initialApplications,
  activeCount,
  cap,
}: {
  initialApplications: AdminApplicationRow[]
  activeCount: number
  cap: number
}) {
  const [rows, setRows] = useState(initialApplications)
  const [liveActiveCount, setLiveActiveCount] = useState(activeCount)
  const [filter, setFilter] = useState<"pending" | "all">("pending")
  const [message, setMessage] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const cohortFull = liveActiveCount >= cap
  const visible =
    filter === "pending"
      ? rows.filter((r) => r.status === "pending")
      : rows

  const onApprove = (userId: string) => {
    if (liveActiveCount >= cap) {
      setMessage(`Cohort is full (${cap} active founding creators).`)
      return
    }
    const customMessage = notes[userId]?.trim() || undefined
    setMessage(null)
    startTransition(async () => {
      const result = await approveFoundingCreatorAction(userId, customMessage)
      if (!result.success) {
        setMessage(result.error || "Approve failed")
        return
      }
      setLiveActiveCount((n) => Math.min(cap, n + 1))
      setRows((prev) =>
        prev.map((r) =>
          r.userId === userId
            ? {
                ...r,
                status: "active",
                plan: "pro",
                grantedAt: new Date().toISOString(),
                expiresAt: new Date(
                  Date.now() + 365 * 24 * 60 * 60 * 1000
                ).toISOString(),
              }
            : r
        )
      )
      setNotes((prev) => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
      setMessage("Approved — Pro granted for 1 year. Email sent to creator.")
    })
  }

  const onReject = (userId: string) => {
    const customMessage = notes[userId]?.trim() || undefined
    setMessage(null)
    startTransition(async () => {
      const result = await rejectFoundingCreatorAction(userId, customMessage)
      if (!result.success) {
        setMessage(result.error || "Reject failed")
        return
      }
      setRows((prev) =>
        prev.map((r) =>
          r.userId === userId
            ? {
                ...r,
                status: "rejected",
                rejectReason: customMessage || null,
              }
            : r
        )
      )
      setNotes((prev) => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
      setMessage("Application rejected. Email sent to creator.")
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Active founding creators:{" "}
          <span className="font-semibold text-gray-900">
            {liveActiveCount}/{cap}
          </span>
          {cohortFull ? (
            <span className="ml-2 text-amber-700">(cohort full — approve disabled)</span>
          ) : null}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === "pending" ? "default" : "outline"}
            className={
              filter === "pending" ? "bg-cyan-700 hover:bg-cyan-800" : ""
            }
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            className={filter === "all" ? "bg-cyan-700 hover:bg-cyan-800" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
        </div>
      </div>

      {message && (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {message}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="text-gray-600">No applications in this view.</p>
      ) : (
        <ul className="space-y-4">
          {visible.map((app) => (
            <li
              key={app.userId}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      {app.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={app.avatar}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
                          {(app.name || app.username || "?")
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {app.name || "Unnamed"}{" "}
                          <span className="font-normal text-gray-500">
                            @{app.username || "—"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">{app.email}</p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm text-gray-600">
                      {app.bio || "No bio"}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Status:{" "}
                      <span className="font-medium">{app.status}</span>
                      {app.appliedAt
                        ? ` · Applied ${new Date(app.appliedAt).toLocaleString()}`
                        : ""}
                      {app.expiresAt
                        ? ` · Expires ${new Date(app.expiresAt).toLocaleDateString()}`
                        : ""}
                    </p>
                    {app.username && (
                      <Link
                        href={`/profile/${encodeURIComponent(app.username)}`}
                        className="mt-2 inline-block text-sm font-medium text-cyan-700 hover:underline"
                      >
                        View profile
                      </Link>
                    )}
                  </div>
                </div>

                {app.status === "pending" && (
                  <div className="border-t border-gray-100 pt-4">
                    <label
                      htmlFor={`note-${app.userId}`}
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Custom message in email (optional)
                    </label>
                    <textarea
                      id={`note-${app.userId}`}
                      rows={3}
                      value={notes[app.userId] || ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [app.userId]: e.target.value,
                        }))
                      }
                      placeholder="Included in the approve or reject email to this creator…"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-cyan-700 focus:outline-none focus:ring-1 focus:ring-cyan-700"
                    />
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="bg-cyan-700 text-white hover:bg-cyan-800"
                        disabled={isPending || cohortFull}
                        onClick={() => onApprove(app.userId)}
                      >
                        Approve &amp; email
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => onReject(app.userId)}
                      >
                        Reject &amp; email
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
