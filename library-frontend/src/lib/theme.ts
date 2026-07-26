export const theme = {
  light: {
    bg: {
      primary: 'bg-white',
      secondary: 'bg-gray-50',
      tertiary: 'bg-gray-100',
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-500',
      muted: 'text-gray-400',
    },
    border: {
      primary: 'border-gray-200',
      secondary: 'border-gray-300',
    },
    nav: {
      bg: 'bg-white',
      shadow: 'shadow',
    },
    card: {
      bg: 'bg-white',
      shadow: 'shadow',
    },
    dropdown: {
      bg: 'bg-white',
      hover: 'hover:bg-gray-100',
      border: 'ring-black ring-opacity-5',
    },
    input: {
      bg: 'bg-white',
      border: 'border-gray-300',
      placeholder: 'placeholder-gray-400',
      focus: 'focus:ring-blue-500 focus:border-blue-500',
    },
    badge: {
      admin: 'bg-purple-100 text-purple-800',
      owner: 'bg-blue-100 text-blue-800',
    },
    spinner: 'border-blue-600',
  },
  dark: {
    bg: {
      primary: 'bg-gray-900',
      secondary: 'bg-gray-800',
      tertiary: 'bg-gray-700',
    },
    text: {
      primary: 'text-gray-100',
      secondary: 'text-gray-300',
      tertiary: 'text-gray-400',
      muted: 'text-gray-500',
    },
    border: {
      primary: 'border-gray-700',
      secondary: 'border-gray-600',
    },
    nav: {
      bg: 'bg-gray-800',
      shadow: 'shadow-lg shadow-gray-900/50',
    },
    card: {
      bg: 'bg-gray-800',
      shadow: 'shadow-lg shadow-gray-900/50',
    },
    dropdown: {
      bg: 'bg-gray-800',
      hover: 'hover:bg-gray-700',
      border: 'ring-gray-600 ring-opacity-50',
    },
    input: {
      bg: 'bg-gray-700',
      border: 'border-gray-600',
      placeholder: 'placeholder-gray-400',
      focus: 'focus:ring-blue-500 focus:border-blue-500',
    },
    badge: {
      admin: 'bg-purple-900 text-purple-200',
      owner: 'bg-blue-900 text-blue-200',
    },
    spinner: 'border-blue-400',
  },
} as const;

export type ThemeMode = 'light' | 'dark';
export type ThemeColors = typeof theme.light;
