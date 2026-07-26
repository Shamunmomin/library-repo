import { useState, useRef, useEffect } from 'react';
import { Menu, X, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import type { Role } from '../types/auth';

interface HeaderProps {
  roleBadge?: {
    label: string;
    color: string;
  };
}

export function Header({ roleBadge }: HeaderProps) {
  const { user, logout } = useAuth();
  const { mode, toggleTheme, colors } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const badgeColorMap: Record<Role, string> = {
    SUPER_ADMIN: colors.badge.admin,
    LIBRARY_OWNER: colors.badge.owner,
  };

  const badge = roleBadge ?? {
    label: user?.role === 'SUPER_ADMIN' ? 'Admin' : 'Owner',
    color: badgeColorMap[user?.role ?? 'LIBRARY_OWNER'],
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`${colors.nav.bg} ${colors.nav.shadow} ${colors.border.primary} border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Brand + Badge */}
          <div className="flex items-center gap-3">
            <h1 className={`text-xl font-bold ${colors.text.primary}`}>Library Management</h1>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          {/* Desktop: User dropdown */}
          <div className="hidden sm:flex items-center">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 px-3 py-2 text-sm ${colors.text.secondary} ${colors.dropdown.hover} rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className={`font-medium ${colors.text.primary}`}>{user?.name}</span>
                <ChevronDown size={16} className={`${colors.text.tertiary} transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className={`absolute right-0 mt-2 w-56 ${colors.dropdown.bg} rounded-md shadow-lg ring-1 ${colors.dropdown.border} z-50`}>
                  <div className={`px-4 py-3 border-b ${colors.border.primary}`}>
                    <p className={`text-sm font-medium ${colors.text.primary}`}>{user?.name}</p>
                    <p className={`text-xs ${colors.text.tertiary} truncate`}>{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        toggleTheme();
                      }}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${colors.text.secondary} ${colors.dropdown.hover}`}
                    >
                      {mode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                      {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Hamburger button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${colors.text.secondary} ${colors.dropdown.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Dropdown menu */}
      {mobileMenuOpen && (
        <div className={`sm:hidden border-t ${colors.border.primary} ${colors.bg.secondary}`}>
          <div className="px-4 py-3 space-y-3">
            <div className={`flex items-center gap-2 text-sm ${colors.text.secondary}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className={`font-medium ${colors.text.primary}`}>{user?.name}</p>
                <p className={`text-xs ${colors.text.tertiary} truncate`}>{user?.email}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${colors.text.secondary} ${colors.dropdown.hover} rounded-md`}
            >
              {mode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
