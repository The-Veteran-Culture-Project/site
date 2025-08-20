import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';

interface MarketingSignupProps {
  className?: string;
  buttonText?: string;
  heading?: string;
  subheading?: string;
}

export default function MarketingSignup({
  className = '',
  buttonText = 'Subscribe',
  heading = 'Get occasional updates on findings, film progress, and ways to stay engaged.',
  subheading = '',
}: MarketingSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Please enter a valid email',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/marketing-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error('Signup failed');
      }
      
      setEmail('');
      
      toast({
        title: 'Thank you for subscribing!',
        description: 'You will receive updates about the project.',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-zinc-800/40 p-6 rounded-lg w-full ${className}`}>
      <div className="text-center space-y-2 mb-4">
        <h3 className="text-lg text-white">{heading}</h3>
        {subheading && <p className="text-zinc-300 text-sm">{subheading}</p>}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-800/60 text-white placeholder:text-zinc-400 py-2 px-3 text-base"
          />
        </div>
        <div className="flex justify-center">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="text-base px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-white"
          >
            {isSubmitting ? 'Subscribing...' : buttonText}
          </Button>
        </div>
      </form>
    </div>
  );
}
