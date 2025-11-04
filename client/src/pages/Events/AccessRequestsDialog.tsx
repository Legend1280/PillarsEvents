import { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  Button,
  Loader
} from '@/components/common';
import { AccessRequest } from '@/types';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AccessRequestsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessRequestsDialog({ isOpen, onClose }: AccessRequestsDialogProps) {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/permissions/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      } else {
        toast.error('Failed to fetch access requests');
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
      toast.error('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/permissions/approve/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Access granted to ${data.user?.name || 'user'}`);
        await fetchRequests();
      } else {
        toast.error(data.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/permissions/deny/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: 'Request denied by administrator'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Request denied');
        await fetchRequests();
      } else {
        toast.error(data.error || 'Failed to deny request');
      }
    } catch (error) {
      console.error('Deny error:', error);
      toast.error('Failed to deny request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
            <XCircle className="h-3 w-3" />
            Denied
          </span>
        );
      default:
        return null;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <ModalHeader>
        <ModalTitle>Access Requests Management</ModalTitle>
        <ModalDescription>
          Review and manage user access requests for event posting permissions.
        </ModalDescription>
      </ModalHeader>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Requests ({pendingRequests.length})
              </h3>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{request.userName}</h4>
                            <p className="text-sm text-muted-foreground">{request.userEmail}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        {request.reason && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Reason:</span> {request.reason}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Requested: {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(request.id)}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeny(request.id)}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Deny
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingRequests.length === 0 && processedRequests.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No access requests found.</p>
            </div>
          )}

          {pendingRequests.length === 0 && processedRequests.length > 0 && (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <CheckCircle2 className="h-10 w-10 mx-auto text-green-600 mb-2" />
              <p className="text-muted-foreground">No pending requests at the moment.</p>
            </div>
          )}

          {/* Processed Requests */}
          {processedRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-muted-foreground">
                Recent Activity ({processedRequests.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {processedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-border rounded-lg p-3 bg-muted/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm text-foreground">{request.userName}</h4>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t mt-6">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

