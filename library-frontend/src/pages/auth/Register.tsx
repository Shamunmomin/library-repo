import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES, APP_NAME } from '../../utils/constants'
import toast from 'react-hot-toast'

interface FormErrors {
  name?: string
  email?: string
  password?: string
  phone?: string
}

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    else if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters'
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!phone.trim()) newErrors.phone = 'Phone number is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, phone.trim())
      navigate(ROUTES.SPLASH)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Registration failed. Please try again.')
    }
  }

  function fieldClass(field: keyof FormErrors) {
    return `w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors
      ${errors[field] ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary-500'}
      bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white text-2xl font-bold mb-4">
            LP
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{APP_NAME}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create your owner account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input id="name" type="text" value={name} onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })) }} className={fieldClass('name')} placeholder="John Doe" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input id="reg-email" type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })) }} className={fieldClass('email')} placeholder="you@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input id="reg-password" type="password" value={password} onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })) }} className={fieldClass('password')} placeholder="At least 6 characters" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input id="phone" type="tel" value={phone} onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: undefined })) }} className={fieldClass('phone')} placeholder="+1 234 567 890" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
