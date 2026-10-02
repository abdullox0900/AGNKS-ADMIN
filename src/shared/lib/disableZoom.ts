/**
 * The app is a fixed-layout Mini App: pinch / double-tap zoom only gets in the way.
 * The viewport meta + `touch-action` in index.css cover Android and Telegram's webview;
 * iOS Safari ignores both for pinch, so those gestures are cancelled here.
 */
export function disableZoom() {
  const stop = (e: Event) => e.preventDefault()
  document.addEventListener('gesturestart', stop)
  document.addEventListener('gesturechange', stop)
  document.addEventListener('gestureend', stop)
  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) e.preventDefault()
    },
    { passive: false },
  )
}
