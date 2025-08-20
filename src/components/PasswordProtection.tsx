import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PasswordProtectionProps {
  onAuthorized: () => void;
}

export function PasswordProtection({ onAuthorized }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if already authorized from session storage
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = sessionStorage.getItem('beta_survey_authorized') === 'true';
      const authTimestamp = sessionStorage.getItem('beta_auth_timestamp');
      
      if (isAuth && authTimestamp) {
        // Verify with server that auth is still valid (check for resets)
        try {
          const response = await fetch('/api/beta-auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              password: '', // Empty password for timestamp check
              authTimestamp 
            }),
          });

          const data = await response.json();
          
          if (data.resetRequired) {
            // Access was reset, clear session and require re-auth
            sessionStorage.removeItem('beta_survey_authorized');
            sessionStorage.removeItem('beta_auth_timestamp');
          } else if (isAuth) {
            onAuthorized();
          }
        } catch (err) {
          // If check fails, proceed with normal auth check
          if (isAuth) {
            onAuthorized();
          }
        }
      }
    };
    
    checkAuth();
  }, [onAuthorized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/beta-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store authorization in session storage with timestamp
        sessionStorage.setItem('beta_survey_authorized', 'true');
        sessionStorage.setItem('beta_auth_timestamp', data.authTimestamp || new Date().toISOString());
        onAuthorized();
      } else {
        setError(data.message || 'Invalid password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSubmitting(true);
    setRequestError('');

    try {
      const response = await fetch('/api/beta-access-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setRequestSuccess(true);
        setEmail('');
        setName('');
      } else {
        setRequestError(data.message || 'Failed to submit request');
      }
    } catch (err) {
      setRequestError('An error occurred. Please try again.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const toggleRequestForm = () => {
    setShowRequestForm(!showRequestForm);
    setRequestError('');
  };

  if (requestSuccess) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-9rem)]">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Request Submitted</CardTitle>
            <CardDescription className="text-center">
              Thank you for your interest in our beta program. We've received your request and will be in touch soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-zinc-400 mb-4">An administrator will review your request and may provide access.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowRequestForm(false)}
              className="mt-2"
            >
              Back to Password Entry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
      <div className="flex justify-center items-center min-h-[calc(100vh-9rem)]">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Beta Access</CardTitle>
            <CardDescription className="text-center">
              This survey is currently in beta testing. Enter the access password to continue.
            </CardDescription>
          </CardHeader>        {!showRequestForm ? (
          <>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter beta password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                    required
                  />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Access Survey'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-sm"
                  onClick={toggleRequestForm}
                >
                  Don't have a password? Request access
                </Button>
              </CardFooter>
            </form>
          </>
        ) : (
          <>
            <form onSubmit={handleRequestSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                    required
                  />
                </div>
                {requestError && <p className="text-sm text-red-500">{requestError}</p>}
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={requestSubmitting}
                >
                  {requestSubmitting ? 'Submitting...' : 'Request Access'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-sm"
                  onClick={toggleRequestForm}
                >
                  Already have a password? Log in
                </Button>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
