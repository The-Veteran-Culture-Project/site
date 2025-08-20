import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BetaAccessRequest {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

interface BetaAccessRequestsTableProps {
  requests: BetaAccessRequest[];
}

export function BetaAccessRequestsTable({ requests }: BetaAccessRequestsTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BetaAccessRequest | null>(null);
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/beta-access-request/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          notes,
          password,
        }),
      });
      
      if (response.ok) {
        toast({
          title: 'Access granted',
          description: `Beta access granted to ${selectedRequest.email}`,
        });
        setIsDialogOpen(false);
        
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to approve the access request',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!selectedRequest) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/beta-access-request/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          notes,
        }),
      });
      
      if (response.ok) {
        toast({
          title: 'Access rejected',
          description: `Beta access rejected for ${selectedRequest.email}`,
        });
        setIsDialogOpen(false);
        
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to reject the access request',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const openDialog = (request: BetaAccessRequest) => {
    setSelectedRequest(request);
    setNotes('');
    setPassword('');
    setIsDialogOpen(true);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-yellow-500 text-white';
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-zinc-400">
                No beta access requests yet.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.name}</TableCell>
                <TableCell>{request.email}</TableCell>
                <TableCell>{formatDate(request.requestedAt)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(request.status)}`}>
                    {request.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {request.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(request)}
                    >
                      Process
                    </Button>
                  )}
                  {request.status !== 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(request)}
                    >
                      View
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === 'pending' 
                ? 'Process Beta Access Request' 
                : 'Beta Access Request Details'}
            </DialogTitle>
            <DialogDescription>
              Request from {selectedRequest?.name} ({selectedRequest?.email})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium">Requested on:</span>
              <span>{selectedRequest && formatDate(selectedRequest.requestedAt)}</span>
            </div>
            
            {selectedRequest?.processedAt && (
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium">Processed on:</span>
                <span>{formatDate(selectedRequest.processedAt)}</span>
              </div>
            )}
            
            {selectedRequest?.status === 'pending' && (
              <>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes about this request"
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium">Temporary Password</label>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Provide a password if approving"
                  />
                  <p className="text-xs text-zinc-400">
                    Leave blank to use the global beta password
                  </p>
                </div>
              </>
            )}
            
            {selectedRequest?.notes && (
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium">Admin Notes:</span>
                <p className="text-sm bg-zinc-100 dark:bg-zinc-800 p-2 rounded">{selectedRequest.notes}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {selectedRequest?.status === 'pending' ? (
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsDialogOpen(false)} className="w-full">
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
