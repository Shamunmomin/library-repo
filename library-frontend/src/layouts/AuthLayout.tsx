import { useEffect } from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      {children}
    </div>
  )
}