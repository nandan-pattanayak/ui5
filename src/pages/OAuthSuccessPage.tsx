import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const OAuthSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = searchParams.get('auth');
    const email = searchParams.get('email');

    if (auth === 'true' && email) {
      // Show success toast
      toast({
        title: "Connected Successfully!",
        description: `Gmail account ${email} has been connected successfully.`,
      });

      // Store connection status in localStorage
      localStorage.setItem('gmailConnected', 'true');
      localStorage.setItem('gmailEmail', email);

      setIsLoading(false);
    } else {
      // Show error toast
      toast({
        title: "Connection Failed",
        description: "Failed to connect Gmail account. Please try again.",
        variant: "destructive",
      });

      setIsLoading(false);
    }
  }, [searchParams, toast]);

  const handleContinue = () => {
    // Check if there's a stored return URL, otherwise default to lead-enrichment
    const returnUrl = localStorage.getItem('returnUrl') || '/dashboard/lead-enrichment';
    localStorage.removeItem('returnUrl'); // Clean up
    navigate(returnUrl);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const auth = searchParams.get('auth');
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <Card className="w-96 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {auth === 'true' ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <AlertCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {auth === 'true' ? 'Connection Successful!' : 'Connection Failed'}
          </CardTitle>
          <CardDescription>
            {auth === 'true' 
              ? `Your Gmail account has been connected successfully.`
              : 'There was an issue connecting your Gmail account.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {auth === 'true' && email && (
            <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-lg">
              <Mail className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">{email}</span>
            </div>
          )}
          
          <Button 
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthSuccessPage;