import React from 'react';
import { Lead } from './LeadCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Phone, 
  ExternalLink, 
  User, 
  DollarSign, 
  Users,
  Star,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactInfoSidebarProps {
  lead: Lead | null;
  onClose: () => void;
}

export const ContactInfoSidebar: React.FC<ContactInfoSidebarProps> = ({ lead, onClose }) => {
  if (!lead) return null;

  const isEnriched = lead.enrichemnt === 'true';

  return (
    <aside
      role="complementary"
      aria-label="Contact Information"
      className="fixed right-0 top-0 h-full w-96 border-l bg-gradient-to-br from-primary/5 via-background to-secondary/5 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 shadow-xl border-primary/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <h2 className="text-lg font-semibold text-primary">Contact Information</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 hover:bg-primary/20 text-primary" aria-label="Close contact sidebar">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-56px)]">
        {/* Company Header */}
        <Card className="glass-card bg-gradient-to-br from-white to-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{lead.company_name}</CardTitle>
              <Badge variant={isEnriched ? 'default' : 'secondary'}>
                {isEnriched ? 'Enriched' : 'Basic'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="w-3 h-3" />
              <a
                href={lead.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Visit Website
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">Score: {lead.score}</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm">{lead.revenue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{lead.company_size}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Personas */}
        <section>
          <h3 className="text-sm font-semibold text-primary mb-2">Target Personas</h3>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(lead.target_persona) ? (
              lead.target_persona.map((persona, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                  {persona}
                </Badge>
              ))
            ) : lead.target_persona ? (
              <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                {String(lead.target_persona)}
              </Badge>
            ) : null}
          </div>
        </section>

        <Separator />

        {/* LinkedIn Profiles */}
        <section>
          <h3 className="text-sm font-semibold text-primary mb-2">LinkedIn Profiles</h3>
          <div className="space-y-2">
            {Object.entries(lead.linkedin_profiles).map(([role, url]) => (
              <div key={role} className="flex items-center justify-between p-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{role}</span>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-soft transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Information - Only if enriched */}
        {isEnriched && (
          <>
            <Separator />

            {/* Email Contacts */}
            {lead.emails && lead.emails.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-green-600 mb-2">Email Contacts ({lead.emails.length})</h3>
                <div className="space-y-2">
                  {lead.emails.map((email, index) => (
                    <Card key={index} className="p-3 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-green-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm break-all">{email.email}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="outline" className="text-xs bg-green-100 border-green-300 text-green-700">{email.emailType}</Badge>
                            <Badge variant="outline" className="text-xs bg-green-100 border-green-300 text-green-700">{email.emailConfidence}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Updated: {email.updateDate}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Phone Contacts */}
            {lead.phones && lead.phones.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-blue-600 mb-2">Phone Contacts ({lead.phones.length})</h3>
                <div className="space-y-2">
                  {lead.phones.map((phone, index) => (
                    <Card key={index} className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{phone.number}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="outline" className="text-xs bg-blue-100 border-blue-300 text-blue-700">{phone.phoneType}</Badge>
                            <Badge variant={phone.doNotCall ? 'destructive' : 'default'} className="text-xs">
                              {phone.doNotCall ? 'Do Not Call' : 'Can Call'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Updated: {phone.updateDate}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <Separator />

        {/* Company Fit Explanation */}
        <section>
          <h3 className="text-sm font-semibold text-primary mb-2">Why This Company Fits</h3>
          <Card className="p-3 bg-gradient-to-r from-accent/20 to-primary/10 border-primary/20">
            <p className="text-sm text-muted-foreground leading-relaxed">{lead.why_company_fit}</p>
          </Card>
        </section>
      </div>
    </aside>
  );
};

export default ContactInfoSidebar;
