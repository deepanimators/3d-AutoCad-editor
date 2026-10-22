'use client'

import { type AnyNode, type AnyNodeId, useScene } from '@aruct/core'
import * as Y from 'yjs'

const REMOTE_ORIGIN = 'remote'
const NODES_KEY = 'nodes'

const toBase64 = (bytes: Uint8Array) => {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}
const fromBase64 = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0))

export type YjsSceneBridgeOptions = {
  roomId: string
  pollMs?: number
  onStatus?: (status: 'connecting' | 'connected' | 'error') => void
}

export class YjsSceneBridge {
  readonly doc = new Y.Doc()
  private readonly nodes = this.doc.getMap<string>(NODES_KEY)
  private readonly roomId: string
  private readonly pollMs: number
  private readonly onStatus?: YjsSceneBridgeOptions['onStatus']
  private unsubscribeScene: (() => void) | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private applyingRemote = false
  private pending: Uint8Array[] = []
  private flushing = false
  private serverSv: string | null = null
  private destroyed = false

  constructor(options: YjsSceneBridgeOptions) {
    this.roomId = options.roomId
    this.pollMs = options.pollMs ?? 1000
    this.onStatus = options.onStatus
  }

  async start() {
    this.onStatus?.('connecting')

    this.doc.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin === REMOTE_ORIGIN) return
      this.pending.push(update)
      void this.flush()
    })

    this.nodes.observe((event, transaction) => {
      if (transaction.origin !== REMOTE_ORIGIN) return
      this.applyRemoteKeys(event.keysChanged)
    })

    await this.pull()
    this.seedLocalNodes()

    this.unsubscribeScene = useScene.subscribe((state, prev) => {
      if (this.applyingRemote || state.nodes === prev.nodes) return
      this.pushLocalDiff(prev.nodes, state.nodes)
    })

    this.timer = setInterval(() => void this.pull(), this.pollMs)
  }

  stop() {
    this.destroyed = true
    this.unsubscribeScene?.()
    if (this.timer) clearInterval(this.timer)
    this.doc.destroy()
  }

  private seedLocalNodes() {
    const local = useScene.getState().nodes as Record<string, AnyNode>
    this.doc.transact(() => {
      for (const [id, node] of Object.entries(local)) {
        if (!this.nodes.has(id)) this.nodes.set(id, JSON.stringify(node))
      }
    })
  }

  private pushLocalDiff(prev: Record<string, AnyNode>, next: Record<string, AnyNode>) {
    this.doc.transact(() => {
      for (const [id, node] of Object.entries(next)) {
        if (prev[id] === node) continue
        const serialized = JSON.stringify(node)
        if (this.nodes.get(id) !== serialized) this.nodes.set(id, serialized)
      }
      for (const id of Object.keys(prev)) {
        if (!(id in next) && this.nodes.has(id)) this.nodes.delete(id)
      }
    })
  }

  private applyRemoteKeys(keys: Set<string>) {
    const store = useScene.getState()
    this.applyingRemote = true
    try {
      for (const id of keys) {
        const serialized = this.nodes.get(id)
        const existing = store.nodes[id as AnyNodeId]
        if (serialized === undefined) {
          if (existing) useScene.getState().deleteNode(id as AnyNodeId)
          continue
        }
        const node = JSON.parse(serialized) as AnyNode
        if (existing) {
          useScene.getState().updateNode(id as AnyNodeId, node)
        } else {
          useScene.getState().createNode(node, (node.parentId ?? undefined) as AnyNodeId | undefined)
        }
      }
    } finally {
      this.applyingRemote = false
    }
  }

  private async pull() {
    if (this.destroyed) return
    try {
      const qs = new URLSearchParams({ roomId: this.roomId })
      if (this.serverSv) qs.set('sv', this.serverSv)
      const res = await fetch(`/api/collab/sync?${qs}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(String(res.status))
      const { update, sv } = (await res.json()) as { update: string; sv: string }
      Y.applyUpdate(this.doc, fromBase64(update), REMOTE_ORIGIN)
      this.serverSv = sv
      this.onStatus?.('connected')
    } catch {
      this.onStatus?.('error')
    }
  }

  private async flush() {
    if (this.flushing || this.pending.length === 0) return
    this.flushing = true
    try {
      while (this.pending.length > 0 && !this.destroyed) {
        const batch = Y.mergeUpdates(this.pending)
        this.pending = []
        const res = await fetch('/api/collab/sync', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ roomId: this.roomId, update: toBase64(batch) }),
        })
        if (!res.ok) {
          this.pending.unshift(batch)
          this.onStatus?.('error')
          break
        }
      }
    } catch {
      this.onStatus?.('error')
    } finally {
      this.flushing = false
    }
  }
}
