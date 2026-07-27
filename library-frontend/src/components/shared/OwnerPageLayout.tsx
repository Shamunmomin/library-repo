import { Header } from '../Header';
import { Footer } from '../Footer';
import { useTheme } from '../../hooks/useTheme';

interface OwnerPageLayoutProps {
  children: React.ReactNode;
}

export function OwnerPageLayout({ children }: OwnerPageLayoutProps) {
  const { colors } = useTheme();

  return (
    <div className={`min-h-screen ${colors.bg.secondary} flex flex-col`}>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
