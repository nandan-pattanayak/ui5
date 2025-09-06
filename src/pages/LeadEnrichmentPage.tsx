import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { LeadCard, Lead } from '@/components/leads/LeadCard';
import { LeadTable } from '@/components/leads/LeadTable';
import { ContactInfoSidebar } from '@/components/leads/ContactInfoSidebar';
import { MailSenderForm } from '@/components/mail/MailSenderForm';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Target, 
  Grid3X3, 
  List, 
  Eye, 
  Mail, 
  Phone,
  Download,
  RefreshCw,
  Search,
  Link,
  Send,
  Calendar,
  ChevronDown
} from 'lucide-react';

const LeadEnrichmentPage: React.FC = () => {
  const [enrichedLeads, setEnrichedLeads] = useState<Lead[]>([]);
  const [allEnrichedLeads, setAllEnrichedLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isLoading, setIsLoading] = useState(false);
  const [showAllEnriched, setShowAllEnriched] = useState(false);
  const [selectedContactLead, setSelectedContactLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState('');
  const [showMailSender, setShowMailSender] = useState(false);
  const [authenticatedUsers, setAuthenticatedUsers] = useState<string[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const { toast } = useToast();
  const { checkCreditsBeforeAction, hasInsufficientCredits } = useCredits();

  useEffect(() => {
    // Clear localStorage on page reload
    localStorage.clear();
    
    // Load enriched leads from localStorage
    const storedEnrichedLeads = localStorage.getItem('enrichedLeads');
    if (storedEnrichedLeads && storedEnrichedLeads !== 'undefined' && storedEnrichedLeads !== 'null') {
      try {
        const parsedLeads = JSON.parse(storedEnrichedLeads);
        if (Array.isArray(parsedLeads)) {
          setEnrichedLeads(parsedLeads);
        }
      } catch (error) {
        console.error('Error parsing stored enriched leads:', error);
        // Clear invalid data from localStorage
        localStorage.removeItem('enrichedLeads');
      }
    }
  }, []);

  const handleGmailConnect = async () => {
    try {
      console.log('Initiating Gmail connect...');
      
      const response = await fetch('https://my-fastapi-service-608954479960.us-central1.run.app/auth/initiate', {
        method: 'GET',
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`Failed to initiate Gmail authentication: ${response.status}`);
      }

      const data = await response.json();
      console.log('Auth data received:', data);
      
      // Store current page to return after authentication
      localStorage.setItem('returnUrl', '/dashboard/lead-enrichment');
      
      // Navigate the top-level window via anchor click to bypass iframe restrictions
      const a = document.createElement('a');
      a.href = data.auth_url;
      a.target = '_top';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Fallback: open in a new tab if top-level redirect is blocked
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          window.open(data.auth_url, '_blank', 'noopener');
        }
      }, 500);
    } catch (error) {
      console.error('Gmail connect error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect to Gmail",
        variant: "destructive",
      });
    }
  };

  const handleOutlookConnect = async () => {
    // Similar implementation for Outlook
    toast({
      title: "Coming Soon",
      description: "Outlook connector will be available soon",
    });
  };

  const handleMailSender = async () => {
    if (selectedLeads.size === 0) {
      toast({
        title: "No Leads Selected",
        description: "Select lead to enable MailSender",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingAuth(true);
    try {
      const response = await fetch('https://my-fastapi-service-608954479960.us-central1.run.app/fetch_authenticate_mailer', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch authenticated mailers');
      }

      const data = await response.json();
      
      if (data.mailer && data.mailer.length > 0) {
        setAuthenticatedUsers(data.mailer);
        setShowMailSender(true);
      } else {
        toast({
          title: "Account Connection Required",
          description: "Connect your account to Enable MailSender",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching authenticated mailers:', error);
      toast({
        title: "Error",
        description: "Failed to check authenticated mailers",
        variant: "destructive",
      });
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleSelectLead = (companyName: string, selected: boolean) => {
    const newSelection = new Set(selectedLeads);
    if (selected) {
      newSelection.add(companyName);
    } else {
      newSelection.delete(companyName);
    }
    setSelectedLeads(newSelection);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.company_name)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleEnrichmentPreview = async () => {
    await checkCreditsBeforeAction(async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://my-fastapi-service-608954479960.us-central1.run.app/find_all_enrichemnt_value', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

      if (!response.ok) {
        throw new Error('Failed to fetch enrichment preview');
      }

      const data = await response.json();
      setAllEnrichedLeads(data);
      setShowAllEnriched(true);
      
      toast({
        title: "Preview Loaded",
        description: `Displaying ${data.length} enriched leads`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load enrichment preview",
        variant: "destructive",
      });
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleExport = (format: 'csv' | 'excel') => {
    const leadsToExport = selectedLeads.size > 0 
      ? filteredLeads.filter(lead => selectedLeads.has(lead.company_name))
      : filteredLeads;

    if (leadsToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "No enriched leads available for export",
        variant: "destructive",
      });
      return;
    }

    // Enhanced CSV export with enriched data
    const headers = [
      'Company Name', 'URL', 'Revenue', 'Company Size', 'Score', 'Target Personas', 
      'Why Company Fit', 'Emails', 'Phones', 'LinkedIn Profiles'
    ];
    
    const csvData = leadsToExport.map(lead => [
      lead.company_name,
      lead.url,
      lead.revenue,
      lead.company_size,
      lead.score.toString(),
      lead.target_persona.join('; '),
      lead.why_company_fit.replace(/,/g, ';'),
      lead.emails ? lead.emails.map(e => `${e.email} (${e.emailType})`).join('; ') : '',
      lead.phones ? lead.phones.map(p => `${p.number} (${p.phoneType})`).join('; ') : '',
      Object.entries(lead.linkedin_profiles).map(([role, url]) => `${role}: ${url}`).join('; ')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `enriched_leads_export.${format === 'csv' ? 'csv' : 'xlsx'}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Downloaded ${leadsToExport.length} enriched leads as ${format.toUpperCase()}`,
    });
  };

  const currentLeads = showAllEnriched ? allEnrichedLeads : enrichedLeads;
  
  // Filter leads based on search term
  const filteredLeads = currentLeads.filter(lead =>
    lead.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalEmails = filteredLeads.reduce((sum, lead) => sum + (lead.emails?.length || 0), 0);
  const totalPhones = filteredLeads.reduce((sum, lead) => sum + (lead.phones?.length || 0), 0);

  if (isLoading) {
    return <LoadingSpinner message="Loading enrichment preview..." />;
  }

  return (
    <div className="relative">
      <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lead Enrichment</h1>
            <p className="text-muted-foreground">
              View and manage your enriched lead data with contact information
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowSearchInput(!showSearchInput)}
              disabled={hasInsufficientCredits}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                  <Mail className="w-4 h-4 mr-2" />
                  Mail Management
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-border shadow-lg z-50">
                <DropdownMenuItem onClick={handleGmailConnect}>
                  <Link className="w-4 h-4 mr-2" />
                  Gmail Connector
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOutlookConnect}>
                  <Link className="w-4 h-4 mr-2" />
                  Outlook Connector
                </DropdownMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <DropdownMenuItem 
                          disabled={selectedLeads.size === 0 || isCheckingAuth}
                          onClick={handleMailSender}
                          className={selectedLeads.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {isCheckingAuth ? 'Checking...' : `MailSender ${selectedLeads.size > 0 ? `(${selectedLeads.size} selected)` : ''}`}
                        </DropdownMenuItem>
                      </div>
                    </TooltipTrigger>
                    {selectedLeads.size === 0 && (
                      <TooltipContent>
                        <p>Select lead to enable MailSender</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenuItem 
                  disabled={selectedLeads.size === 0}
                  className={selectedLeads.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  MailSchedular {selectedLeads.size > 0 && `(${selectedLeads.size} selected)`}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              onClick={handleEnrichmentPreview}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              <Eye className="w-4 h-4 mr-2" />
              Enrichment Preview
            </Button>
          </div>
        </div>
        
        {/* Search Input */}
        {showSearchInput && (
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search leads by company name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{filteredLeads.length}</p>
                  <p className="text-sm text-muted-foreground">Enriched Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalEmails}</p>
                  <p className="text-sm text-muted-foreground">Email Contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalPhones}</p>
                  <p className="text-sm text-muted-foreground">Phone Contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {currentLeads.filter(lead => lead.enrichemnt === "true").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Fully Enriched</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">%</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredLeads.length > 0 ? Math.round(filteredLeads.reduce((sum, lead) => sum + lead.score, 0) / filteredLeads.length) : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  onClick={() => setViewMode('cards')}
                  size="sm"
                  className={viewMode === 'cards' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400'}
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  onClick={() => setViewMode('table')}
                  size="sm"
                  className={viewMode === 'table' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400'}
                >
                  <List className="w-4 h-4 mr-2" />
                  Table
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSelectAll(false)}
                  variant="outline"
                  size="sm"
                  disabled={selectedLeads.size === 0}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50"
                >
                  Clear Selection
                </Button>
                
                <Button
                  onClick={() => handleSelectAll(true)}
                  variant="outline"
                  size="sm"
                  disabled={filteredLeads.length === 0}
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50"
                >
                  Select All
                </Button>
                
                {showAllEnriched && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAllEnriched(false)}
                    size="sm"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                  >
                    Show Recent Only
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  size="sm"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV ({selectedLeads.size > 0 ? selectedLeads.size : filteredLeads.length})
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleExport('excel')}
                  size="sm"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                >
                   <Download className="w-4 h-4 mr-2" />
                   Export Excel ({selectedLeads.size > 0 ? selectedLeads.size : filteredLeads.length})
                 </Button>
               </div>
             </div>
           </CardContent>
         </Card>

        {/* Enriched Leads Display */}
        {filteredLeads.length === 0 ? (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>No Enriched Leads Found</CardTitle>
              <CardDescription>
                {searchTerm 
                  ? `No leads found matching "${searchTerm}"`
                  : showAllEnriched 
                    ? "No enriched leads available in the system"
                    : "Enrich some leads first to see detailed contact information here"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.history.back()} className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6 py-3 rounded-xl">
                Go Back
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Data Source Indicator */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light rounded-xl">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {showAllEnriched ? "Showing all enriched leads" : "Showing recently enriched leads"}
                </span>
              </div>
            </div>

            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={`${lead.company_name}-${lead.timestamp || Date.now()}`}
                    lead={lead}
                    isSelected={selectedLeads.has(lead.company_name)}
                    onSelect={(selected) => handleSelectLead(lead.company_name, selected)}
                    showSelection={true}
                    showEnrichmentButton={false}
                    onViewContact={() => setSelectedContactLead(lead)}
                  />
                ))}
              </div>
            ) : (
              <LeadTable
                leads={filteredLeads}
                selectedLeads={selectedLeads}
                onSelectLead={handleSelectLead}
                onSelectAll={handleSelectAll}
                showSelection={true}
                showEnrichmentButton={false}
                onViewContact={setSelectedContactLead}
              />
            )}
          </>
        )}

        {/* Contact Info Sidebar */}
        {selectedContactLead && (
          <ContactInfoSidebar
            lead={selectedContactLead}
            onClose={() => setSelectedContactLead(null)}
          />
        )}

        {/* Mail Sender Dialog */}
        <Dialog open={showMailSender} onOpenChange={setShowMailSender}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Mail Sender</DialogTitle>
              <DialogDescription>
                Send emails to selected leads using your authenticated accounts
              </DialogDescription>
            </DialogHeader>
            <MailSenderForm
              authenticatedUsers={authenticatedUsers}
              selectedLeads={selectedLeads}
              leadEmails={Array.from(selectedLeads).flatMap(leadName => {
                const lead = enrichedLeads.find(l => l.company_name === leadName) || 
                           allEnrichedLeads.find(l => l.company_name === leadName);
                return lead?.emails?.map(e => e.email) || [];
              }).filter(Boolean)}
              onClose={() => setShowMailSender(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
    </div>
  );
};

export default LeadEnrichmentPage;