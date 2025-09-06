import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { CreditLockOverlay } from './CreditLockOverlay';
import { useCredits } from '@/hooks/useCredits';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { credits, hasInsufficientCredits, fetchCredits } = useCredits();

  const handleRecharge = () => {
    // In a real app, this would open a payment modal or redirect to billing
    window.open('https://example.com/billing', '_blank');
    // Refresh credits after potential recharge
    setTimeout(() => {
      fetchCredits();
    }, 2000);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-primary-light/30 to-accent">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>

        {/* Credit Lock Overlay */}
        {hasInsufficientCredits && (
          <CreditLockOverlay
            credits={credits}
            onRecharge={handleRecharge}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;