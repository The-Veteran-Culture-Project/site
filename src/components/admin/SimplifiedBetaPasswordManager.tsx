import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Copy, Eye, EyeOff, RefreshCw, TestTube, Mail, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BetaAccessRequest {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  passwordSent?: boolean;
}

interface Props {
  accessRequests?: BetaAccessRequest[];
}

export function SimplifiedBetaPasswordManager({ accessRequests = [] }: Props) {
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchCurrentPassword();
  }, []);

  const fetchCurrentPassword = async () => {
    try {
      const response = await fetch('/api/admin/beta-password');
      if (!response.ok) throw new Error('Failed to fetch current password');

      const data = await response.json();
      if (data.success) {
        setCurrentPassword(data.password);
        setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated) : null);
      }
    } catch (error) {
      console.error('Error fetching beta password:', error);
      toast({
        title: 'Error',
        description: 'Failed to load current beta password',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/beta-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Beta password updated successfully',
        });
        fetchCurrentPassword();
        setPassword('');
      } else {
        throw new Error(data.message || 'Failed to update beta password');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    setIsGenerating(true);
    // Generate a simple, memorable password
    const adjectives = ['happy', 'clever', 'brave', 'swift', 'bright', 'calm'];
    const nouns = ['tiger', 'eagle', 'dragon', 'phoenix', 'wolf', 'lion'];
    const numbers = Math.floor(Math.random() * 100);
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const generated = `${adjective}${noun}${numbers}`;
    
    setPassword(generated);
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentPassword);
      toast({
        title: 'Copied!',
        description: 'Password copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy password',
        variant: 'destructive',
      });
    }
  };

  const testPasswordProtection = () => {
    if (confirm('This will clear your beta access and require you to enter the password again. Continue?')) {
      sessionStorage.removeItem('beta_survey_authorized');
      sessionStorage.removeItem('beta_auth_timestamp');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('betaAccessCleared'));
      
      toast({
        title: 'Access Cleared',
        description: 'Access cleared! Opening survey page to test protection...',
      });
      
      // Open survey page in new tab to test protection
      setTimeout(() => {
        window.open('/survey/1', '_blank');
      }, 1000);
    }
  };

  const resetAllAccess = async () => {
    if (!confirm('Reset all beta access? All users will need to re-enter the password.')) return;

    console.log('Starting reset all access...');
    setIsResetLoading(true);
    try {
      const response = await fetch('/api/admin/reset-beta-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Reset response status:', response.status);
      const data = await response.json();
      console.log('Reset response data:', data);
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'All beta access has been reset',
        });
      } else {
        throw new Error(data.message || 'Failed to reset beta access');
      }
    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/beta-access-request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          notes: `${action === 'approved' ? 'Access granted' : 'Access denied'} via simplified admin interface`,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Request ${action} successfully`,
        });
        // Refresh the page to show updated requests
        window.location.reload();
      } else {
        throw new Error(`Failed to ${action} request`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handlePasswordSentToggle = async (requestId: string, passwordSent: boolean) => {
    try {
      const response = await fetch(`/api/admin/beta-access-request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passwordSent,
          notes: `Password ${passwordSent ? 'marked as sent' : 'marked as not sent'}`,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Password status updated to ${passwordSent ? 'sent' : 'not sent'}`,
        });
        // Refresh the page to show updated requests
        window.location.reload();
      } else {
        throw new Error('Failed to update password sent status');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleSendPassword = async (request: BetaAccessRequest) => {
    try {
      // First get the current password
      const passwordResponse = await fetch('/api/admin/beta-password');
      const passwordData = await passwordResponse.json();
      
      if (!passwordData.success) {
        throw new Error('Failed to get current password');
      }

      // Here you could integrate with an email service
      // For now, we'll just copy to clipboard and mark as sent
      await navigator.clipboard.writeText(passwordData.password);
      
      // Mark as sent
      await handlePasswordSentToggle(request.id, true);
      
      toast({
        title: 'Password Ready',
        description: `Password copied to clipboard. You can now send it to ${request.email}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to prepare password for sending',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Password Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Current Beta Password</span>
            {lastUpdated && (
              <span className="text-sm font-normal text-muted-foreground">
                Updated {lastUpdated.toLocaleDateString()}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-lg font-mono">
              {showPassword ? currentPassword : '••••••••••••'}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="shrink-0"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Update Password */}
      <Card>
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generatePassword}
                disabled={isGenerating}
                className="shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !password.trim()}
              className="w-full"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={testPasswordProtection}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              Test Protection
            </Button>
            <Button
              variant="destructive"
              onClick={resetAllAccess}
              disabled={isResetLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isResetLoading ? 'animate-spin' : ''}`} />
              {isResetLoading ? 'Resetting...' : 'Reset All Access'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Test protection clears your access. Reset all forces everyone to re-enter the password.
          </p>
        </CardContent>
      </Card>

          {/* Access Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Beta Access Requests ({accessRequests.filter(r => r.status === 'pending').length} pending)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Password Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No beta access requests yet. When users request access, they'll appear here.
                    </TableCell>
                  </TableRow>
                ) : (
                  accessRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {request.status === 'pending' && (
                            <>
                              <Clock className="h-4 w-4 text-yellow-500" />
                              <span className="text-yellow-600">Pending</span>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-600">Approved</span>
                            </>
                          )}
                          {request.status === 'rejected' && (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-600">Rejected</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={request.passwordSent || false}
                            onCheckedChange={(checked) => handlePasswordSentToggle(request.id, checked)}
                            disabled={request.status !== 'approved'}
                          />
                          <span className="text-sm text-muted-foreground">
                            {request.passwordSent ? 'Sent' : 'Not sent'}
                          </span>
                          {request.status === 'approved' && !request.passwordSent && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendPassword(request)}
                              className="ml-2"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Send
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' && (
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestAction(request.id, 'approved')}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestAction(request.id, 'rejected')}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {request.status !== 'pending' && request.processedAt && (
                          <span className="text-sm text-muted-foreground">
                            {new Date(request.processedAt).toLocaleDateString()}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </div>
      );
    }
