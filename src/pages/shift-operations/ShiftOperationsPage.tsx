import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Sheet } from '@/shared/ui/Sheet'
import { Button } from '@/shared/ui/Button'
import { useShiftOperations } from '@/shared/api/hooks'
import { formatMoney, formatTime } from '@/shared/lib/format'
import { apiVoidSpend } from '@/shared/api/client'
import { useToast } from '@/shared/ui/Toast'
import { useSWRConfig } from 'swr'
import type { SpendOperation } from '@/entities/spendOperation'

const VOID_WINDOW_MS = 5 * 60 * 1000
const REASONS = ["Noto'g'ri summa", 'Mijoz fikridan qaytdi', 'Boshqa']

export function ShiftOperationsPage() {
  const { data: operations, isLoading } = useShiftOperations()
  const { mutate } = useSWRConfig()
  const { show } = useToast()
  const [voidTarget, setVoidTarget] = useState<SpendOperation | null>(null)

  function canVoid(op: SpendOperation) {
    return op.status === 'applied' && Date.now() - new Date(op.createdAt).getTime() < VOID_WINDOW_MS
  }

  async function handleVoid(reason: string) {
    if (!voidTarget) return
    await apiVoidSpend(voidTarget.id, reason)
    setVoidTarget(null)
    mutate((key) => Array.isArray(key) && key[0] === '/cashier/spend')
    mutate('/cashier/shifts/current')
    show('Operatsiya bekor qilindi')
  }

  return (
    <Screen padded={false}>
      <PageHeader title="Smena yechimlari" />
      <div className="px-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !operations || operations.length === 0 ? (
          <EmptyState icon={<Receipt size={26} />} title="Bu smenada hali yechim yo'q" />
        ) : (
          <div className="rounded-2xl bg-[var(--color-surface)] px-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            {operations.map((op) => (
              <div key={op.id} className="flex items-center gap-3 border-b border-[var(--color-border)] py-3.5 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-[var(--color-ink)]">{op.clientName}</p>
                  <p className="mt-0.5 text-[13px] text-[var(--color-ink-tertiary)]">
                    {formatTime(new Date(op.createdAt))}
                    {op.status === 'void' && <span className="text-[var(--color-danger)]"> · Bekor qilingan</span>}
                  </p>
                </div>
                <p className={`tnum shrink-0 text-[15px] font-semibold ${op.status === 'void' ? 'text-[var(--color-ink-tertiary)] line-through' : 'text-[var(--color-ink)]'}`}>
                  {formatMoney(op.amount)}
                </p>
                {canVoid(op) && (
                  <button
                    onClick={() => setVoidTarget(op)}
                    className="shrink-0 text-[13px] font-semibold text-[var(--color-danger)]"
                  >
                    Bekor qilish
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={!!voidTarget} onClose={() => setVoidTarget(null)} title="Sababni tanlang">
        <div className="space-y-2 pb-6">
          {REASONS.map((r) => (
            <Button key={r} variant="ghost" onClick={() => void handleVoid(r)}>
              {r}
            </Button>
          ))}
        </div>
      </Sheet>
    </Screen>
  )
}
