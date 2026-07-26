import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useTheme } from '../../hooks/useTheme';

export function OwnerDashboard() {
  const { colors } = useTheme();

  return (
    <div className={`min-h-screen ${colors.bg.secondary} flex flex-col`}>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
        <h2 className={`text-2xl font-bold ${colors.text.primary}`}>Owner Dashboard</h2>
        <p className={`mt-2 ${colors.text.secondary}`}>Welcome to your library dashboard.</p>
      </main>
      <Footer />
    </div>
  );
}
