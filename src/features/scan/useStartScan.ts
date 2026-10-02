import { useNavigate } from 'react-router-dom'

/** Opens the scan flow. The scan page itself picks Telegram's native scanner or the camera.
 * From the error page it replaces that page, so Back goes home instead of to the failed attempt. */
export function useStartScan() {
  const navigate = useNavigate()
  return () => navigate('/spend/scan', { replace: window.location.pathname === '/spend/error' })
}
