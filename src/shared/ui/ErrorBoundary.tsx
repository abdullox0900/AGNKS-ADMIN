import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-[15px] font-medium text-[var(--color-ink)]">Nimadir ishlamadi</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[14px] font-semibold text-[var(--color-primary)]"
            >
              Qayta yuklash
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
