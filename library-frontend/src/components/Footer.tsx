import { useTheme } from '../hooks/useTheme';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { colors } = useTheme();

  return (
    <footer className={`${colors.bg.primary} border-t ${colors.border.primary}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className={`text-sm ${colors.text.tertiary}`}>
            &copy; {currentYear} Library Management System. All rights reserved.
          </p>
          <div className={`flex items-center gap-4 text-sm ${colors.text.tertiary}`}>
            <span>Support</span>
            <span className={colors.text.muted}>|</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
