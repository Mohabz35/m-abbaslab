'use client'

export default function BackgroundElements() {
  return (
    <>
      <div className="fixed inset-0 -z-20 overflow-hidden opacity-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <div className="fixed top-1/4 -left-4 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl opacity-30 animate-float" />
      <div className="fixed bottom-1/4 -right-4 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl opacity-30 animate-float-delayed" />
    </>
  )
}