import { Wallet } from 'lucide-react';
import { useTheme } from 'next-themes';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // Check if we're in a green header context
  const isGreenHeader = className.includes('text-white') || className.includes('bg-gradient');

  // Determine if we're in dark mode or green header
  const isDark = resolvedTheme === 'dark' || theme === 'dark';
  const shouldUseWhite = isDark || isGreenHeader;

  return (
    <div className={`flex items-center gap-2 font-bold ${sizeClasses[size]} ${className}`}>
      <Wallet className={`${iconSizes[size]} ${shouldUseWhite ? 'text-white' : 'text-black'}`} />
      <span className={shouldUseWhite ? 'text-white' : 'text-black'}>PocketPilot</span>
    </div>
  );
}
