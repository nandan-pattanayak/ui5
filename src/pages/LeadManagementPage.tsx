import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { LeadCard, Lead } from '@/components/leads/LeadCard';
import { LeadTable } from '@/components/leads/LeadTable';
import { ContactInfoSidebar } from '@/components/leads/ContactInfoSidebar';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Users, 
  Grid3X3, 
  List, 
  Target, 
  Download, 
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeadManagementPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContactLead, setSelectedContactLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const { toast } = useToast();
  const { checkCreditsBeforeAction, hasInsufficientCredits } = useCredits();
  const navigate = useNavigate();

  useEffect(() => {
    // Load leads from localStorage
    const storedLeads = localStorage.getItem('generatedLeads');
    if (storedLeads && storedLeads !== 'undefined' && storedLeads !== 'null') {
      try {
        const parsedLeads = JSON.parse(storedLeads);
        if (Array.isArray(parsedLeads)) {
          setLeads(parsedLeads);
        }
      } catch (error) {
        console.error('Error parsing stored leads:', error);
        // Clear invalid data from localStorage
        localStorage.removeItem('generatedLeads');
      }
    }
  }, []);

  // Filter leads based on search term
  const filteredLeads = leads.filter(lead =>
    lead.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleEnrichment = async () => {
    if (selectedLeads.size === 0) {
      toast({
        title: "No leads selected",
        description: "Please select at least one lead to enrich",
        variant: "destructive",
      });
      return;
    }

    await checkCreditsBeforeAction(async () => {
      setIsLoading(true);
      try {
        const queryId = localStorage.getItem('queryId') || 'default_query';
        const selectedLeadData = filteredLeads.filter(lead => selectedLeads.has(lead.company_name));
        
        const updates = selectedLeadData.map(lead => ({
          company_name: lead.company_name,
          linkedin_profiles: Object.values(lead.linkedin_profiles).filter(url => url && url.trim() !== '')
        }));

        const response = await fetch('https://my-fastapi-service-608954479960.us-central1.run.app/update_linkedin_profiles_with_lusha_bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            query_id: queryId,
            updates
          }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Enrichment service endpoint not found. Please check if the server is running.');
          }
          throw new Error(`Enrichment failed with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Store enriched leads and redirect to enrichment page
        localStorage.setItem('enrichedLeads', JSON.stringify(data.leads));
        
        toast({
          title: "Success!",
          description: `Enriched ${data.leads.length} leads with detailed contact information`,
        });

        navigate('/dashboard/lead-enrichment');
      } catch (error) {
        toast({
          title: "Enrichment Failed",
          description: error instanceof Error ? error.message : "Failed to enrich leads",
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
        description: "Please select leads or generate some leads first",
        variant: "destructive",
      });
      return;
    }

    // Convert leads to CSV format
    const headers = ['Company Name', 'URL', 'Revenue', 'Company Size', 'Score', 'Target Personas', 'Why Company Fit'];
    const csvData = leadsToExport.map(lead => [
      lead.company_name,
      lead.url,
      lead.revenue,
      lead.company_size,
      lead.score.toString(),
      lead.target_persona.join('; '),
      lead.why_company_fit.replace(/,/g, ';') // Replace commas to avoid CSV issues
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export.${format === 'csv' ? 'csv' : 'xlsx'}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Downloaded ${leadsToExport.length} leads as ${format.toUpperCase()}`,
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Enriching your leads..." />;
  }

  return (
    <div className="relative">
      <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
            <p className="text-muted-foreground">
              Manage and organize your generated leads
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowSearchInput(!showSearchInput)}
              disabled={hasInsufficientCredits}
              variant="blue"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
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
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
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
                <RefreshCw className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredLeads.filter(lead => lead.enrichemnt === "true").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Enriched</p>
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
                  onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                  variant="outline"
                  size="sm"
                >
                  {viewMode === 'cards' ? <List className="w-4 h-4 mr-2" /> : <Grid3X3 className="w-4 h-4 mr-2" />}
                  View ({viewMode === 'cards' ? 'Table' : 'Cards'})
                </Button>
              </div>

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
                
                <Button
                  onClick={handleEnrichment}
                  disabled={selectedLeads.size === 0}
                  variant="blue"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Enrich Selected ({selectedLeads.size})
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Display */}
        {filteredLeads.length === 0 ? (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>No Leads Found</CardTitle>
              <CardDescription>
                {searchTerm 
                  ? `No leads found matching "${searchTerm}"`
                  : "Generate some leads first to see them here"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/dashboard/lead-generation')}>
                Generate Leads
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.company_name}
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
      </div>
    </DashboardLayout>
    </div>
  );
};

export default LeadManagementPage;