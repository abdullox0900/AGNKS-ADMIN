import { useEffect } from 'react'
import { getTelegram } from './telegram'
import { apiLinkTelegram } from '@/shared/api/client'

const ASKED_KEY = 'agnks-admin-write-access-asked'

/**
 * When the webapp is opened inside Telegram by a signed-in cashier: link the Telegram chat to the account so the
 * bot can send the evening summary, and — once per device — ask Telegram for permission to message them
 * (a native Telegram dialog; the bot never writes first without it). Logging in itself stays phone + password.
 */
export function useLinkTelegram() {
  useEffect(() => {
    const tg = getTelegram()
    if (!tg?.initData) return
    void apiLinkTelegram(tg.initData)

    if (tg.initDataUnsafe?.user?.allows_write_to_pm === true || !tg.requestWriteAccess) return
    try {
      if (localStorage.getItem(ASKED_KEY)) return
      localStorage.setItem(ASKED_KEY, '1')
    } catch {
      return
    }
    try {
      tg.requestWriteAccess()
    } catch {
      /* older Telegram — nothing to do */
    }
  }, [])
}
