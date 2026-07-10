import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#030303]/95 via-[#0a0a0a]/80 to-primary/40 pointer-events-none z-0" />

          <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl text-center space-y-4 relative z-10 shadow-glass">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-display">Erro Inesperado</h1>
            <p className="text-white/50 text-sm leading-relaxed">
              {this.state.error?.message ||
                'Ocorreu um erro ao carregar a aplicação. Por favor, tente novamente.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full h-12 text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-glow bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white border border-primary/50 rounded-md"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
