import { useEffect, useRef, forwardRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, children, className = '' }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`relative z-50 w-full max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-lg ${className}`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring z-10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
};

export const ModalHeader = ({ children, className = '' }: ModalHeaderProps) => {
  return (
    <div className={`flex flex-col gap-2 text-center sm:text-left mb-4 ${className}`}>
      {children}
    </div>
  );
};

export const ModalTitle = ({ children, className = '' }: ModalTitleProps) => {
  return (
    <h2 className={`text-lg font-semibold leading-none ${className}`}>
      {children}
    </h2>
  );
};

export const ModalDescription = ({ children, className = '' }: ModalDescriptionProps) => {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  );
};

// Alert Dialog Components
interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 w-full max-w-lg mx-4">
        {children}
      </div>
    </div>
  );
};

export const AlertDialogContent = ({ children }: AlertDialogContentProps) => {
  return (
    <div className="rounded-lg border border-border bg-background p-6 shadow-lg">
      {children}
    </div>
  );
};

export const AlertDialogHeader = ({ children }: AlertDialogHeaderProps) => {
  return <div className="flex flex-col gap-2 mb-4">{children}</div>;
};

export const AlertDialogTitle = ({ children }: AlertDialogTitleProps) => {
  return <h2 className="text-lg font-semibold">{children}</h2>;
};

export const AlertDialogDescription = ({ children }: AlertDialogDescriptionProps) => {
  return <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={typeof children === 'string' ? { __html: children } : undefined}>{typeof children !== 'string' && children}</p>;
};

export const AlertDialogFooter = ({ children }: AlertDialogFooterProps) => {
  return <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-6">{children}</div>;
};

export const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AlertDialogAction.displayName = 'AlertDialogAction';

export const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 border border-border bg-transparent hover:bg-accent ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AlertDialogCancel.displayName = 'AlertDialogCancel';

