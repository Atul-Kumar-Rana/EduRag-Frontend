import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function TopBar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <h1 className="text-lg font-bold text-primary-hover">EduRAG</h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md hover:bg-accent transition-colors"
      >
        {isDark ? <Sun className="h-5 w-5 text-foreground" /> : <Moon className="h-5 w-5 text-foreground" />}
      </button>
    </header>
  );
}
