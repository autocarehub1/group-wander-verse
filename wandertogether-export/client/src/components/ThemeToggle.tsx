import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="touch-target relative transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-md border-2 border-primary/40 hover:border-primary/60 shadow-lg hover:shadow-xl font-semibold btn-animated glow-on-hover"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute left-3 h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          <span className="ml-1 text-sm font-medium">
            {theme === 'system' ? 'Auto' : theme === 'light' ? 'Light' : 'Dark'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-44 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 border-2 border-primary/40 bg-background/98 backdrop-blur-lg shadow-2xl"
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={`cursor-pointer transition-colors duration-200 font-medium ${
            theme === 'light' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light Mode
          {theme === 'light' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={`cursor-pointer transition-colors duration-200 font-medium ${
            theme === 'dark' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark Mode
          {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={`cursor-pointer transition-colors duration-200 font-medium ${
            theme === 'system' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
        >
          <Monitor className="mr-2 h-4 w-4" />
          Auto (System)
          {theme === 'system' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Simple toggle button for mobile/compact layouts
export const SimpleThemeToggle = () => {
  const { actualTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(actualTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="touch-target relative transition-all duration-300 hover:scale-105"
      aria-label={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} theme`}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
    </Button>
  );
};