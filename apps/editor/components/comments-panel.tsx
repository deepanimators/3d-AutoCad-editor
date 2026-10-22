'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageSquare, Check, ChevronDown, ChevronRight, Send } from 'lucide-react'
import { useFirebaseUser } from '@/lib/use-auth'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Comment = {
  id: string
  sceneId: string
  userId: string
  nodeId?: string | null
  positionX?: number | null
  positionY?: number | null
  text: string
  resolved: boolean
  parentId?: string | null
  createdAt: string
  updatedAt: string
  // augmented client-side
  authorName?: string
}

type Filter = 'all' | 'open' | 'resolved'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const AVATAR_COLORS = [
  '#e63946', '#f4a261', '#2a9d8f', '#457b9d',
  '#6a4c93', '#f72585', '#06d6a0', '#ffd166',
]

function avatarColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]!
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Avatar({ userId, name }: { userId: string; name: string }) {
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: avatarColor(userId) }}
      title={name}
    >
      {initials(name)}
    </div>
  )
}

function ReplyForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (text: string) => Promise<void>
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { ref.current?.focus() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(text.trim())
      setText('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-1.5">
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply…"
        rows={2}
        className="w-full resize-none rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!text.trim() || submitting}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          <Send className="h-3 w-3" />
          Reply
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function CommentCard({
  comment,
  replies,
  currentUserId,
  onResolve,
  onDelete,
  onReply,
  onNodeClick,
}: {
  comment: Comment
  replies: Comment[]
  currentUserId: string | null
  onResolve: (id: string, resolved: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onReply: (parentId: string, text: string) => Promise<void>
  onNodeClick: (nodeId: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [showReply, setShowReply] = useState(false)
  const name = comment.authorName ?? comment.userId.slice(0, 8)

  return (
    <div
      className={`rounded-lg border border-border bg-card p-3 transition-opacity ${
        comment.resolved ? 'opacity-60' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <Avatar userId={comment.userId} name={name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-foreground truncate">{name}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {relativeTime(comment.createdAt)}
            </span>
            {comment.resolved && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-1.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                <Check className="h-2.5 w-2.5" />
                Resolved
              </span>
            )}
          </div>
          {comment.nodeId && (
            <button
              type="button"
              onClick={() => onNodeClick(comment.nodeId!)}
              className="mt-0.5 text-xs text-primary hover:underline truncate block max-w-full text-left"
            >
              {comment.nodeId}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onResolve(comment.id, !comment.resolved)}
            title={comment.resolved ? 'Unresolve' : 'Resolve'}
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          {currentUserId && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              title="Delete"
              className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-muted transition-colors text-xs leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <p className="mt-2 text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
        {comment.text}
      </p>

      {/* Replies section */}
      {replies.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </button>
          {expanded && (
            <div className="mt-2 ml-4 flex flex-col gap-2 border-l-2 border-border pl-3">
              {replies.map((reply) => {
                const rName = reply.authorName ?? reply.userId.slice(0, 8)
                return (
                  <div key={reply.id} className="flex items-start gap-2">
                    <Avatar userId={reply.userId} name={rName} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-medium text-foreground">{rName}</span>
                        <span className="text-xs text-muted-foreground">
                          {relativeTime(reply.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-foreground whitespace-pre-wrap break-words">
                        {reply.text}
                      </p>
                    </div>
                    {currentUserId === reply.userId && (
                      <button
                        type="button"
                        onClick={() => onDelete(reply.id)}
                        title="Delete reply"
                        className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-muted transition-colors text-xs leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Reply toggle / form */}
      {!comment.resolved && (
        <div className="mt-2">
          {showReply ? (
            <ReplyForm
              onSubmit={async (text) => {
                await onReply(comment.id, text)
                setShowReply(false)
              }}
              onCancel={() => setShowReply(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowReply(true)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Reply
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function CommentsPanel({
  sceneId,
  onNodeHighlight,
}: {
  sceneId: string
  onNodeHighlight?: (nodeId: string) => void
}) {
  const { user } = useFirebaseUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [newText, setNewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  async function fetchComments() {
    try {
      const res = await fetch(`/api/scenes/${sceneId}/comments`)
      if (!res.ok) throw new Error(await res.text())
      const data: Comment[] = await res.json()
      setComments(data)
    } catch {
      setError('Failed to load comments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId])

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  async function createComment(text: string, parentId?: string) {
    const res = await fetch(`/api/scenes/${sceneId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, parentId }),
    })
    if (!res.ok) throw new Error(await res.text())
    const created: Comment = await res.json()
    setComments((prev) => [...prev, created])
  }

  async function resolveComment(id: string, resolved: boolean) {
    const res = await fetch(`/api/scenes/${sceneId}/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved }),
    })
    if (!res.ok) return
    const updated: Comment = await res.json()
    setComments((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }

  async function deleteComment(id: string) {
    const res = await fetch(`/api/scenes/${sceneId}/comments/${id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 204) return
    setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id))
  }

  async function handleNewComment(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim() || submitting) return
    setSubmitting(true)
    try {
      await createComment(newText.trim())
      setNewText('')
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const roots = comments.filter((c) => !c.parentId)
  const repliesMap = new Map<string, Comment[]>()
  for (const c of comments) {
    if (c.parentId) {
      const arr = repliesMap.get(c.parentId) ?? []
      arr.push(c)
      repliesMap.set(c.parentId, arr)
    }
  }

  const visible = roots.filter((c) => {
    if (filter === 'open') return !c.resolved
    if (filter === 'resolved') return c.resolved
    return true
  })

  const openCount = roots.filter((c) => !c.resolved).length

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Comments</h2>
          {openCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
              {openCount}
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 border-b border-border px-4">
        {(['all', 'open', 'resolved'] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`pb-2 pt-2.5 px-2 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${
              filter === f
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {loading && (
          <p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
        )}
        {!loading && error && (
          <p className="text-sm text-destructive text-center py-6">{error}</p>
        )}
        {!loading && !error && visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {filter === 'resolved'
                ? 'No resolved comments yet.'
                : filter === 'open'
                ? 'No open comments.'
                : 'No comments yet. Add one below.'}
            </p>
          </div>
        )}
        {visible.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            replies={repliesMap.get(comment.id) ?? []}
            currentUserId={user?.uid ?? null}
            onResolve={resolveComment}
            onDelete={deleteComment}
            onReply={async (parentId, text) => { await createComment(text, parentId) }}
            onNodeClick={(nodeId) => onNodeHighlight?.(nodeId)}
          />
        ))}
      </div>

      {/* New comment form */}
      {user && (
        <form
          onSubmit={handleNewComment}
          className="border-t border-border p-4 flex flex-col gap-2"
        >
          <div className="flex items-start gap-2">
            <Avatar userId={user.uid} name={user.displayName ?? user.email ?? 'You'} />
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Add a comment…"
              rows={2}
              className="flex-1 resize-none rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newText.trim() || submitting}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              <Send className="h-3 w-3" />
              Comment
            </button>
          </div>
        </form>
      )}
      {!user && (
        <p className="border-t border-border p-4 text-xs text-muted-foreground text-center">
          Sign in to leave a comment.
        </p>
      )}
    </div>
  )
}
