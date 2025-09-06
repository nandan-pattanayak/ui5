import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { ContactInfoSidebar } from '@/components/leads/ContactInfoSidebar';
import { LeadTable } from '@/components/leads/LeadTable';
import { Lead } from '@/components/leads/LeadCard';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Database, 
  Grid3X3, 
  List, 
  Download, 
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Target,
  Search
} from 'lucide-react';

const BulkLeadPage: React.FC = () => {
  const [bulkLeads, setBulkLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table'>('table');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContactLead, setSelectedContactLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'enriched' | 'basic'>('all');
  const { toast } = useToast();
  const { checkCreditsBeforeAction, hasInsufficientCredits } = useCredits();

  useEffect(() => {
    // Auto-load bulk data on component mount
    handleLoadBulkData();
  }, []);

  const fetchBulkLeads = async () => {
    await checkCreditsBeforeAction(async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://my-fastapi-service-608954479960.us-central1.run.app/find_bulk_data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            session_id: 'default_session'
          }),
        });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Bulk data endpoint not found. Please check if the server is running.');
        }
        throw new Error(`Failed to load bulk data with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setBulkLeads(data);
        toast({
          title: "Success!",
          description: `Loaded ${data.length} bulk leads`,
        });
      } else if (data.leads && Array.isArray(data.leads)) {
        setBulkLeads(data.leads);
        toast({
          title: "Success!",
          description: `Loaded ${data.leads.length} bulk leads`,
        });
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        toast({
          title: "Load Failed",
          description: error instanceof Error ? error.message : "Failed to load bulk data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleLoadBulkData = fetchBulkLeads;

  // Filter leads based on search term and status
  const filteredLeads = bulkLeads.filter(lead => {
    const matchesSearch = lead.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'enriched' && lead.enrichemnt === "true") ||
      (statusFilter === 'basic' && lead.enrichemnt !== "true");
    return matchesSearch && matchesStatus;
  });

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

  const handleExport = (format: 'csv' | 'excel') => {
    const leadsToExport = selectedLeads.size > 0 
      ? filteredLeads.filter(lead => selectedLeads.has(lead.company_name))
      : filteredLeads;

    if (leadsToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "No bulk leads available for export",
        variant: "destructive",
      });
      return;
    }

    try {
      // Enhanced CSV export with enriched data
      const headers = [
        'Company Name', 'URL', 'Revenue', 'Company Size', 'Score', 'Target Personas', 
        'Why Company Fit', 'Emails', 'Phones', 'LinkedIn Profiles'
      ];
      
      const csvData = leadsToExport.map(lead => [
        lead.company_name || '',
        lead.url || '',
        lead.revenue || '',
        lead.company_size || '',
        (lead.score || 0).toString(),
        Array.isArray(lead.target_persona) ? lead.target_persona.join('; ') : (lead.target_persona || ''),
        (lead.why_company_fit || '').replace(/,/g, ';'),
        lead.emails ? lead.emails.map(e => `${e.email} (${e.emailType || 'unknown'})`).join('; ') : '',
        lead.phones ? lead.phones.map(p => `${p.number} (${p.phoneType || 'unknown'})`).join('; ') : '',
        lead.linkedin_profiles && typeof lead.linkedin_profiles === 'object' 
          ? Object.entries(lead.linkedin_profiles).map(([role, url]) => `${role}: ${url}`).join('; ')
          : ''
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${(cell || '').toString()}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bulk_leads_export_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Downloaded ${leadsToExport.length} bulk leads as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export lead data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalEmails = filteredLeads.reduce((sum, lead) => sum + (lead.emails?.length || 0), 0);
  const totalPhones = filteredLeads.reduce((sum, lead) => sum + (lead.phones?.length || 0), 0);

  if (isLoading) {
    return <LoadingSpinner message="Loading bulk leads..." />;
  }

  return (
    <div className="relative">
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Bulk Leads</h1>
              <p className="text-muted-foreground">
                View and manage bulk lead data from the system
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowSearchInput(!showSearchInput)}
                disabled={isLoading || hasInsufficientCredits}
                className="btn-futuristic"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button
                onClick={fetchBulkLeads}
                disabled={isLoading || hasInsufficientCredits}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Load Data
              </Button>
              <Button
                onClick={handleLoadBulkData}
                disabled={isLoading}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
        </div>

        {/* Search and Filter */}
        {showSearchInput && (
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="space-y-4">
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
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

          {/* Filter Controls */}
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">Filter by status:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    All ({bulkLeads.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'enriched' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('enriched')}
                  >
                    Enriched ({bulkLeads.filter(lead => lead.enrichemnt === "true").length})
                  </Button>
                  <Button
                    variant={statusFilter === 'basic' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('basic')}
                  >
                    Basic ({bulkLeads.filter(lead => lead.enrichemnt !== "true").length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{filteredLeads.length}</p>
                    <p className="text-sm text-muted-foreground">Total Leads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{selectedLeads.size}</p>
                    <p className="text-sm text-muted-foreground">Selected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">@</span>
                  </div>
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
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">📞</span>
                  </div>
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
                    onClick={() => handleSelectAll(false)}
                    variant="outline"
                    size="sm"
                    disabled={selectedLeads.size === 0}
                  >
                    Clear Selection
                  </Button>
                  
                  <Button
                    onClick={() => handleSelectAll(true)}
                    variant="outline"
                    size="sm"
                    disabled={filteredLeads.length === 0}
                  >
                    Select All
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExport('csv')}
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export CSV ({selectedLeads.size > 0 ? selectedLeads.size : filteredLeads.length})
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleExport('excel')}
                    size="sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Excel ({selectedLeads.size > 0 ? selectedLeads.size : filteredLeads.length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Leads Display */}
          {filteredLeads.length === 0 ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>No Bulk Leads Found</CardTitle>
                <CardDescription>
                  {searchTerm 
                    ? `No leads found matching "${searchTerm}"`
                    : "No bulk lead data available at the moment"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleLoadBulkData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Data
                </Button>
              </CardContent>
            </Card>
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

          {/* Contact Info Sidebar */}
          {selectedContactLead && (
            <ContactInfoSidebar
              lead={selectedContactLead}
              onClose={() => setSelectedContactLead(null)}
            />
          )}
        </div>
      </DashboardLayout>
    </div>
  );
};

export default BulkLeadPage;