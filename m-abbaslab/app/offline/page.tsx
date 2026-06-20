'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 2.122a1.5 1.5 0 112.121 2.121 1.5 1.5 0 01-2.121-2.121z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">You&apos;re Offline</h1>
        <p className="text-gray-400 mb-6">
          No internet connection detected. Some features may be unavailable.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
