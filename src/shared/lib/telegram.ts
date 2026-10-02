interface TelegramWebApp {
  ready: () => void
  expand: () => void
  initData: string
  initDataUnsafe: { user?: { id: number; first_name?: string; last_name?: string; username?: string } }
  BackButton: { show: () => void; hide: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void }
  HapticFeedback: {
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
  }
  showScanQrPopup: (params: { text?: string }, cb: (text: string) => boolean | void) => void
  closeScanQrPopup: () => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  disableVerticalSwipes?: () => void
  onEvent: (event: string, cb: () => void) => void
  offEvent: (event: string, cb: () => void) => void
  isVersionAtLeast: (version: string) => boolean
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

export function getTelegram(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null
}

export function isInTelegram(): boolean {
  return !!getTelegram()?.initData
}

export function tgReady() {
  const tg = getTelegram()
  try {
    tg?.ready()
    tg?.expand()
    tg?.disableVerticalSwipes?.()
  } catch {
    /* not in telegram */
  }
}

export function tgHaptic(type: 'error' | 'success' | 'warning') {
  try {
    getTelegram()?.HapticFeedback.notificationOccurred(type)
  } catch {
    /* noop */
  }
}

export function tgImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') {
  try {
    getTelegram()?.HapticFeedback.impactOccurred(style)
  } catch {
    /* noop */
  }
}

export function tgShowScanQrPopup(onText: (text: string) => boolean | void, text?: string): boolean {
  const tg = getTelegram()
  if (!tg?.showScanQrPopup) return false
  try {
    tg.showScanQrPopup({ text }, onText)
    return true
  } catch {
    return false
  }
}

export function tgCloseScanQrPopup() {
  try {
    getTelegram()?.closeScanQrPopup()
  } catch {
    /* noop */
  }
}

/** Fires when the user dismisses Telegram's scan popup without scanning anything. Returns an unsubscribe. */
export function tgOnScanClosed(cb: () => void): () => void {
  const tg = getTelegram()
  if (!tg?.onEvent) return () => {}
  try {
    tg.onEvent('scanQrPopupClosed', cb)
  } catch {
    return () => {}
  }
  return () => {
    try {
      tg.offEvent('scanQrPopupClosed', cb)
    } catch {
      /* noop */
    }
  }
}

export function tgSetBackButton(onClick: () => void): () => void {
  const tg = getTelegram()
  if (!tg?.BackButton) return () => {}
  try {
    tg.BackButton.show()
    tg.BackButton.onClick(onClick)
    return () => {
      try {
        tg.BackButton.offClick(onClick)
        tg.BackButton.hide()
      } catch {
        /* noop */
      }
    }
  } catch {
    return () => {}
  }
}

export function tgEnableClosingConfirmation(enable: boolean) {
  try {
    if (enable) getTelegram()?.enableClosingConfirmation()
    else getTelegram()?.disableClosingConfirmation()
  } catch {
    /* noop */
  }
}

export function tgUser() {
  return getTelegram()?.initDataUnsafe?.user ?? null
}
