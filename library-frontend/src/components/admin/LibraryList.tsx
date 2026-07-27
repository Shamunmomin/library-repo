import { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { libraryApi } from '../../services/libraryService';
import type { Library } from '../../types/library';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../hooks/useTheme';

export function LibraryList() {
  const { colors } = useTheme();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleTarget, setToggleTarget] = useState<Library | null>(null);

  const fetchLibraries = async () => {
    try {
      const response = await libraryApi.getAllLibraries();
      setLibraries(response.data);
    } catch {
      toast.error('Failed to fetch libraries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraries();
  }, []);

  const handleToggle = async () => {
    if (!toggleTarget) return;
    try {
      const response = await libraryApi.toggleLibraryActive(toggleTarget.id);
      setLibraries((prev) =>
        prev.map((l) => (l.id === toggleTarget.id ? response.data : l))
      );
      toast.success(`Library ${response.data.active ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to toggle library status');
    } finally {
      setToggleTarget(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (libraries.length === 0) {
    return (
      <EmptyState
        title="No libraries"
        description="No libraries have been registered yet."
      />
    );
  }

  return (
    <>
      <div className={`${colors.card.bg} ${colors.card.shadow} rounded-lg border ${colors.border.primary} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={colors.bg.tertiary}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Name</th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Owner</th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Address</th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Phone</th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Status</th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {libraries.map((library) => (
                <tr key={library.id} className={colors.dropdown.hover}>
                  <td className={`px-4 py-3 text-sm font-medium ${colors.text.primary}`}>{library.name}</td>
                  <td className={`px-4 py-3 text-sm ${colors.text.secondary}`}>{library.ownerName}</td>
                  <td className={`px-4 py-3 text-sm ${colors.text.secondary}`}>{library.address || '-'}</td>
                  <td className={`px-4 py-3 text-sm ${colors.text.secondary}`}>{library.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={library.active ? 'success' : 'danger'}>
                      {library.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setToggleTarget(library)}
                      className={`p-1.5 rounded-md ${colors.text.tertiary} ${colors.dropdown.hover}`}
                      title={library.active ? 'Deactivate' : 'Activate'}
                    >
                      {library.active ? (
                        <ToggleRight size={20} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={20} className="text-gray-400" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        title={toggleTarget?.active ? 'Deactivate Library' : 'Activate Library'}
        message={`Are you sure you want to ${toggleTarget?.active ? 'deactivate' : 'activate'} "${toggleTarget?.name}"?`}
        confirmText={toggleTarget?.active ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.active ? 'danger' : 'default'}
      />
    </>
  );
}
