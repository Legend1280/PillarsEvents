import { Loader2 } from 'lucide-react';

interface LoaderProps {
  className?: string;
  size?: number;
}

export const Loader = ({ className = '', size }: LoaderProps) => {
  const sizeClass = size ? `h-${size} w-${size}` : 'h-8 w-8';
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`animate-spin text-primary ${sizeClass} ${className}`} />
    </div>
  );
};

