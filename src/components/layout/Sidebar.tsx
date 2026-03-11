import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, BookOpen, Bot, FileText, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const navItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Admin', url: '/admin', icon: Settings },
  { title: 'Practice', url: '/practice', icon: BookOpen },
  { title: 'Doubt Solver', url: '/chatbot', icon: Bot },
  { title: 'Question Bank', url: '/questions', icon: FileText },
];

export function AppSidebar() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] flex-col border-r border-border bg-sidebar h-screen sticky top-0">
        <div className="p-5">
          <h1 className="text-xl font-bold text-primary-hover tracking-tight">EduRAG</h1>
          <p className="text-xs text-muted-foreground mt-0.5">AI Study Platform</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <p className="text-xs text-muted-foreground px-3 mt-2">v1.0.0</p>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-sidebar flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-xs transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
