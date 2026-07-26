'use client'

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Member = {
  userId: string
  role: string
  user: { name: string | null; email: string | null; plan: string | null }
}

type Invitation = {
  id: string
  email: string
  role: string
  status: string
  expiresAt: string
}

type WorkspaceScene = { id: string; name: string; nodeCount: number; updatedAt: string; thumbnailUrl: string | null; ownerId: string | null }

type Props = {
  slug: string
  orgName: string
  members: Member[]
  pendingInvites: Invitation[]
  currentUserId: string
  currentUserOrgRole: string
}

export function OrgDashboardClient({ slug, orgName, members, pendingInvites, currentUserId, currentUserOrgRole }: Props) {
  const router = useRouter()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canManage = currentUserOrgRole === 'owner' || currentUserOrgRole === 'admin'

  const [orgScenes, setOrgScenes] = useState<WorkspaceScene[]>([])
  const [scenesLoading, setScenesLoading] = useState(true)

  useEffect(() => {
    void fetch(`/api/orgs/${slug}/scenes`)
      .then(r => r.json())
      .then((data: { scenes?: WorkspaceScene[] }) => { setOrgScenes(data.scenes ?? []); setScenesLoading(false) })
      .catch(() => setScenesLoading(false))
  }, [slug])

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setInviteError(null)
    setInviteLink(null)
    try {
      const res = await fetch(`/api/orgs/${slug}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const data = await res.json() as { inviteUrl?: string; error?: string }
      if (!res.ok) {
        setInviteError(data.error ?? 'invite_failed')
      } else {
        setInviteLink(data.inviteUrl ?? null)
        setInviteEmail('')
        router.refresh()
      }
    } catch {
      setInviteError('network_error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm('Remove this member?')) return
    const res = await fetch(`/api/orgs/${slug}/members/${userId}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold">{orgName}</h1>

      <section>
        <h2 className="text-lg font-medium mb-4">Members</h2>
        <div className="border rounded-lg divide-y">
          {members.map(m => (
            <div key={m.userId} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{m.user.name ?? '—'}</p>
                <p className="text-sm text-muted-foreground">{m.user.email ?? '—'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full capitalize">{m.role}</span>
                {currentUserOrgRole === 'owner' && m.role !== 'owner' && m.userId !== currentUserId && (
                  <button
                    onClick={() => handleRemove(m.userId)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {pendingInvites.length > 0 && (
        <section>
          <h2 className="text-lg font-medium mb-4">Pending Invitations</h2>
          <div className="border rounded-lg divide-y">
            {pendingInvites.map(inv => (
              <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm">{inv.email}</p>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full capitalize">{inv.role}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-medium mb-4">Workspace Scenes</h2>
        {scenesLoading ? (
          <p className="text-sm text-muted-foreground">Loading scenes…</p>
        ) : orgScenes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No scenes shared with this workspace yet.
            <br />
            <span className="text-xs">Open a scene and use &quot;Share with Workspace&quot; to add it here.</span>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orgScenes.map(scene => (
              <li key={scene.id} className="rounded-lg border border-border bg-background p-3 hover:border-border/80 transition-colors">
                <Link href={`/scene/${scene.id}`} className="block">
                  <div className="mb-2 flex aspect-video items-center justify-center overflow-hidden rounded-md bg-muted">
                    {scene.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={scene.thumbnailUrl} alt={scene.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground text-xs">No thumbnail</span>
                    )}
                  </div>
                  <p className="truncate font-medium text-sm">{scene.name}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{scene.nodeCount} nodes</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {canManage && (
        <section>
          <h2 className="text-lg font-medium mb-4">Invite Member</h2>
          <form onSubmit={handleInvite} className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm bg-background"
                placeholder="colleague@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Role</label>
              <select
                value={inviteRole}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setInviteRole(e.target.value as 'admin' | 'member')}
                className="border rounded px-3 py-2 text-sm bg-background"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50"
            >
              {submitting ? 'Inviting…' : 'Invite'}
            </button>
          </form>
          {inviteError && <p className="text-sm text-destructive mt-2">{inviteError}</p>}
          {inviteLink && (
            <div className="mt-3 p-3 bg-muted rounded text-sm">
              <p className="font-medium mb-1">Invite link (share with the invitee):</p>
              <code className="break-all">{inviteLink}</code>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
