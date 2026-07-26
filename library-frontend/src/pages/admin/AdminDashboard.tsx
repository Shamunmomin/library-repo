import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="mt-2 text-gray-600">Welcome, Super Admin. Manage your libraries here.</p>
      </main>
      <Footer />
    </div>
  );
}
