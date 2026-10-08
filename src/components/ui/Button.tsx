import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'buy' | 'sell';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, children, disabled, className = '', ...rest }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

    const variants: Record<string, string> = {
      primary:   'bg-[color:var(--accent)] text-[#0a1628] hover:bg-[color:var(--accent-hover)] focus-visible:outline-[color:var(--focus)] disabled:opacity-40',
      secondary: 'bg-[color:var(--surface-strong)] text-[color:var(--ink)] border border-[color:var(--border)] hover:bg-[color:var(--surface-hover)] disabled:opacity-40',
      ghost:     'bg-transparent text-[color:var(--ink-2)] hover:bg-[color:var(--surface)] disabled:opacity-40',
      danger:    'bg-[color:var(--danger-dim)] text-[color:var(--danger)] border border-[color:var(--danger-dim)] hover:bg-[color:var(--danger)] hover:text-white disabled:opacity-40',
      buy:       'bg-[color:var(--buy-dim)] text-[color:var(--buy)] border border-[color:var(--buy-dim)] hover:bg-[color:var(--buy)] hover:text-[#0a1628] active:scale-[0.98] disabled:opacity-40',
      sell:      'bg-[color:var(--sell-dim)] text-[color:var(--sell)] border border-[color:var(--sell-dim)] hover:bg-[color:var(--sell)] hover:text-white active:scale-[0.98] disabled:opacity-40',
    };

    const sizes: Record<string, string> = {
      xs: 'px-2.5 py-1   text-xs h-7',
      sm: 'px-3   py-1.5 text-sm h-8',
      md: 'px-4   py-2   text-sm h-10',
      lg: 'px-5   py-2.5 text-base h-12',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
