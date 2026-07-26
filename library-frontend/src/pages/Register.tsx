import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Role, type RegisterRequest } from '../types/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role),
});

export function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser, getDashboardPath } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterRequest) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      navigate(getDashboardPath(), { replace: true });
    } catch {
      // Error handled by axios interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${colors.bg.secondary} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className={`text-center text-3xl font-bold ${colors.text.primary}`}>
            Library Management
          </h1>
          <h2 className={`mt-2 text-center text-sm ${colors.text.secondary}`}>
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className={`block text-sm font-medium ${colors.text.primary}`}>
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className={`mt-1 block w-full px-3 py-2 border ${colors.input.border} ${colors.input.bg} ${colors.text.primary} rounded-md shadow-sm ${colors.input.placeholder} focus:outline-none ${colors.input.focus}`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${colors.text.primary}`}>
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`mt-1 block w-full px-3 py-2 border ${colors.input.border} ${colors.input.bg} ${colors.text.primary} rounded-md shadow-sm ${colors.input.placeholder} focus:outline-none ${colors.input.focus}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="username" className={`block text-sm font-medium ${colors.text.primary}`}>
                Username
              </label>
              <input
                {...register('username')}
                type="text"
                id="username"
                className={`mt-1 block w-full px-3 py-2 border ${colors.input.border} ${colors.input.bg} ${colors.text.primary} rounded-md shadow-sm ${colors.input.placeholder} focus:outline-none ${colors.input.focus}`}
                placeholder="Choose a username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${colors.text.primary}`}>
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className={`mt-1 block w-full px-3 py-2 border ${colors.input.border} ${colors.input.bg} ${colors.text.primary} rounded-md shadow-sm ${colors.input.placeholder} focus:outline-none ${colors.input.focus}`}
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="role" className={`block text-sm font-medium ${colors.text.primary}`}>
                Account Type
              </label>
              <select
                {...register('role')}
                id="role"
                className={`mt-1 block w-full px-3 py-2 border ${colors.input.border} ${colors.input.bg} ${colors.text.primary} rounded-md shadow-sm focus:outline-none ${colors.input.focus}`}
              >
                <option value={Role.LIBRARY_OWNER}>Library Owner</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>

          <p className={`text-center text-sm ${colors.text.secondary}`}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
