import { Modal, ModalHeader, ModalTitle, ModalDescription, Button } from '@/components/common';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'error' | 'auth-error' | null;
  message?: string;
}

export default function RequestAccessModal({ 
  isOpen, 
  onClose, 
  status,
  message 
}: RequestAccessModalProps) {
  
  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />;
      case 'auth-error':
        return <XCircle className="h-16 w-16 text-orange-600 mx-auto mb-4" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return 'Request Sent Successfully!';
      case 'error':
        return 'Request Failed';
      case 'auth-error':
        return 'Authentication Required';
      default:
        return '';
    }
  };

  const getDefaultMessage = () => {
    switch (status) {
      case 'success':
        return 'Access request sent to administrator successfully! You will be notified when approved.';
      case 'error':
        return 'Failed to send access request. Please try again.';
      case 'auth-error':
        return 'You must be logged in to request access.';
      default:
        return '';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-md"
    >
      <div className="text-center py-6 px-4">
        {getIcon()}
        
        <ModalHeader className="mb-4 text-center">
          <ModalTitle className="text-2xl font-bold mb-2 text-center">
            {getTitle()}
          </ModalTitle>
        </ModalHeader>

        <ModalDescription className="text-base text-muted-foreground mb-6 text-center mx-auto max-w-md">
          {message || getDefaultMessage()}
        </ModalDescription>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto min-w-[120px]"
            size="lg"
          >
            OK
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto min-w-[120px]"
            size="lg"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

