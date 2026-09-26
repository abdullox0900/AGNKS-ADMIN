import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isInTelegram, tgSetBackButton } from './telegram'

export function useBackButton(onBack?: () => void) {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = onBack ?? (() => navigate(-1))
    if (!isInTelegram()) return
    return tgSetBackButton(handler)
  }, [navigate, onBack])

  return { showFallback: !isInTelegram(), goBack: onBack ?? (() => navigate(-1)) }
}
