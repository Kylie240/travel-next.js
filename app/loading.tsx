export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-travel-900 border-t-transparent"></div>
        <p className="text-lg font-medium text-gray-600">Loading...</p>
      </div>
    </div>
  )
} 