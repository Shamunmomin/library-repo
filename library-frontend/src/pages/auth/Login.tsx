import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES, APP_NAME } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {}
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    try {
      await login(email, password)
      navigate(ROUTES.SPLASH)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white text-2xl font-bold mb-4">
            LP
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{APP_NAME}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })) }}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors
                ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary-500'}
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })) }}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors
                ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary-500'}
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400`}
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary-600 hover:text-primary-700 font-medium">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
