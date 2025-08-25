import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface EnhancedButtonProps extends React.ComponentProps<typeof Button> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'travel' | 'travel-outline';
  children?: React.ReactNode;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant as any}
        className={cn(
          // Base enhanced styling
          'transition-all duration-200 ease-in-out',
          'hover:scale-105 active:scale-95',
          'focus:ring-2 focus:ring-offset-2',
          
          // Travel variant styling
          variant === 'travel' && [
            'bg-gradient-to-r from-blue-500 to-blue-600',
            'hover:from-blue-600 hover:to-blue-700',
            'text-white font-semibold',
            'shadow-lg hover:shadow-xl',
            'border-0 focus:ring-blue-500'
          ],
          
          // Travel outline variant
          variant === 'travel-outline' && [
            'border-2 border-blue-500 text-blue-600',
            'hover:bg-blue-500 hover:text-white',
            'dark:border-blue-400 dark:text-blue-400',
            'dark:hover:bg-blue-400 dark:hover:text-blue-900',
            'shadow-md hover:shadow-lg',
            'focus:ring-blue-500'
          ],
          
          className
        )}
        {...props}
      />
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton };