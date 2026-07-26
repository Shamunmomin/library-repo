import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { libraryApi } from '../../api/library';
import { useTheme } from '../../hooks/useTheme';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateLibraryFormProps {
  onSuccess: () => void;
}

export function CreateLibraryForm({ onSuccess }: CreateLibraryFormProps) {
  const { colors } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await libraryApi.createLibrary({
        name: data.name,
        address: data.address || undefined,
        phone: data.phone || undefined,
      });
      toast.success('Library created successfully!');
      onSuccess();
    } catch {
      // Error handled by interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-6 border ${colors.border.primary}`}>
      <div className="flex items-center gap-3 mb-4">
        <Building2 size={24} className="text-blue-600" />
        <h3 className={`text-lg font-semibold ${colors.text.primary}`}>Create Your Library</h3>
      </div>
      <p className={`text-sm ${colors.text.secondary} mb-4`}>
        Set up your library profile to get started.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${colors.text.primary}`}>Library Name *</label>
          <input
            {...register('name')}
            className={`mt-1 block w-full px-3 py-2 border ${colors.input.border} ${colors.input.bg} ${colors.text.primary} rounded-md shadow-sm ${colors.input.placeholder} focus:outline-none ${colors.input.focus}`}
            placeholder="Enter library name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className={`block text-sm font-medium ${colors.text.primary}`}>Address</label>
          <input
            {...register('address')}
            className={`mt-1 block w-full px-3 py-2 border ${colors.input.border} ${colors.input.bg} ${colors.text.primary} rounded-md shadow-sm ${colors.input.placeholder} focus:outline-none ${colors.input.focus}`}
            placeholder="Enter address"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${colors.text.primary}`}>Phone</label>
          <input
            {...register('phone')}
            className={`mt-1 block w-full px-3 py-2 border ${colors.input.border} ${colors.input.bg} ${colors.text.primary} rounded-md shadow-sm ${colors.input.placeholder} focus:outline-none ${colors.input.focus}`}
            placeholder="Enter phone number"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Library'}
        </button>
      </form>
    </div>
  );
}
