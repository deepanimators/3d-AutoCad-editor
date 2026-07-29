import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin: Coupons',
}

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { coupons } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { CouponsClient } from './coupons-client'

export default async function CouponsPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/coupons')
  if (session.role !== 'admin') redirect('/')

  const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.createdAt))

  return (
    <div className="px-8 py-8 space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-foreground">Coupons</h1>
        <p className="mt-1 text-muted-foreground text-sm">{allCoupons.length} total coupons</p>
      </div>
      <CouponsClient initialCoupons={allCoupons} />
    </div>
  )
}
