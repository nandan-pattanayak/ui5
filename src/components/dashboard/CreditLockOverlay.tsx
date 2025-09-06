import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock, AlertTriangle } from 'lucide-react';

interface CreditLockOverlayProps {
  credits: number | null;
  onRecharge?: () => void;
}

export const CreditLockOverlay: React.FC<CreditLockOverlayProps> = ({ 
  credits, 
  onRecharge 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto border-destructive/50 bg-background/95">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Access Locked
          </CardTitle>
          <CardDescription className="text-base">
            Your account has {credits === 0 ? 'no credits' : 'insufficient credits'} remaining
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Current Credits</span>
            </div>
            <div className="text-3xl font-bold text-destructive">
              {credits !== null ? credits : '--'}
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>All dashboard functionality has been disabled.</p>
            <p className="mt-1">Please recharge your account to continue using MarkAssist.</p>
          </div>
          
          <Button
            onClick={onRecharge}
            className="w-full btn-futuristic"
            size="lg"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Recharge Credits
          </Button>
          
          <div className="text-xs text-center text-muted-foreground">
            Contact support if you need assistance
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditLockOverlay;