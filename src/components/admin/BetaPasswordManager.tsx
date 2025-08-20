import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export function BetaPasswordManager() {
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Load current password on mount
  useEffect(() => {
    fetchCurrentPassword();
  }, []);

  const fetchCurrentPassword = async () => {
    try {
      const response = await fetch('/api/admin/beta-password');
      if (!response.ok) {
        throw new Error('Failed to fetch current password');
      }

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
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/beta-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Beta password updated successfully',
        });
        fetchCurrentPassword(); // Refresh the displayed password
        setPassword(''); // Clear input
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update beta password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating beta password:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAccess = async () => {
    if (!confirm('Are you sure you want to reset all beta access? This will require all users to enter the password again.')) {
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch('/api/admin/reset-beta-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Beta access has been reset for all users',
        });
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to reset beta access',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error resetting beta access:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setResetLoading(false);
    }
  };

  const clearYourAccess = () => {
    if (confirm('This will clear your current beta access and require you to enter the password again to test the beta page. Continue?')) {
      sessionStorage.removeItem('beta_survey_authorized');
      toast({
        title: 'Success',
        description: 'Your beta access has been cleared. You can now test the password protection.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Beta Password</CardTitle>
          <CardDescription>
            Change the password required to access the survey during beta testing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPassword && (
            <div className="mb-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Current Password:</p>
              <p className="font-mono text-lg">{currentPassword}</p>
              {lastUpdated && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="new-password" className="block text-sm">
                  New Beta Password
                </label>
                <Input
                  id="new-password"
                  type="text"
                  placeholder="Enter new beta password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading || !password.trim()}
            className="w-full"
          >
            {isLoading ? 'Updating...' : 'Update Beta Password'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Management</CardTitle>
          <CardDescription>
            Manage beta password access for testing. No user accounts required - just password-based access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Testing Password Protection</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                Clear your browser's session to test the password protection screen and access request features.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearYourAccess}
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-900/30"
              >
                Clear My Beta Access
              </Button>
            </div>
            
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Reset All Access</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                This will invalidate all current sessions. Anyone with the password will need to enter it again.
              </p>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleResetAccess}
                disabled={resetLoading}
              >
                {resetLoading ? 'Resetting...' : 'Reset All Beta Access'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
