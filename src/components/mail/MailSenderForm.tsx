import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, Mail, User, Paperclip, Sparkles, Wand2 } from 'lucide-react';

interface MailSenderFormProps {
  authenticatedUsers: string[];
  selectedLeads: Set<string>;
  leadEmails: string[]; // Array of lead emails to send to
  onClose: () => void;
}

export const MailSenderForm: React.FC<MailSenderFormProps> = ({ 
  authenticatedUsers, 
  selectedLeads, 
  leadEmails,
  onClose 
}) => {
  const [selectedSender, setSelectedSender] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [templatePrompt, setTemplatePrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSendEmail = async () => {
    if (!selectedSender || !subject || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('mailer', selectedSender);
      formData.append('to_email', leadEmails.join(','));
      formData.append('subject', subject);
      
      formData.append('message', message);
      
      // Add attachments if any
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch('https://my-fastapi-service-608954479960.us-central1.run.app/send-mail', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      toast({
        title: "Emails Sent Successfully",
        description: `Sent ${selectedLeads.size} emails from ${selectedSender}`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send emails",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateMailTemplate = async () => {
    if (!templatePrompt.trim()) {
      toast({
        title: "Template Prompt Required",
        description: "Please enter a description for the email template you want to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTemplate(true);
    try {
      const response = await fetch('https://my-fastapi-service-608954479960.us-central1.run.app/mail-template-gen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: templatePrompt }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate email template');
      }

      const emailTemplate = await response.json();
      
      // Construct the full message from the structured response
      const fullMessage = `${emailTemplate.greeting}

${emailTemplate.body}

${emailTemplate.cta}

${emailTemplate.closing}
${emailTemplate.sender_details.name}
${emailTemplate.sender_details.title}
${emailTemplate.sender_details.company}
${emailTemplate.sender_details.website}`;

      // Fill the form with the generated template
      setSubject(emailTemplate.subject);
      setMessage(fullMessage);
      setShowPromptInput(false);
      setTemplatePrompt('');

      toast({
        title: "AI Template Generated!",
        description: "Your personalized email template has been created and filled into the form.",
      });
    } catch (error) {
      console.error('Error generating template:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-background border border-border shadow-card">
        <CardHeader className="pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-lg">
              <Mail className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Mail Composer
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Send emails to {selectedLeads.size} selected lead{selectedLeads.size > 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] p-6">
            <div className="space-y-6">
            {/* Sender Selection */}
            <div className="space-y-3">
              <Label htmlFor="sender" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                From Account
              </Label>
              <Select value={selectedSender} onValueChange={setSelectedSender}>
                <SelectTrigger className="h-12 border border-border focus:border-primary bg-background">
                  <SelectValue placeholder="Choose your email account..." />
                </SelectTrigger>
                <SelectContent>
                  {authenticatedUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        {user}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recipients Display */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Recipients ({leadEmails.length})
              </Label>
              <div className="max-h-32 overflow-y-auto p-4 bg-muted/50 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground">
                  {leadEmails.join(', ')}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-3">
              <Label htmlFor="subject" className="text-sm font-semibold text-foreground">
                Subject Line
              </Label>
              <Input
                id="subject"
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-12 border border-border focus:border-primary bg-background"
              />
            </div>

            {/* Message */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="message" className="text-sm font-semibold text-foreground">
                  Message Content
                </Label>
                <Button
                  type="button"
                  onClick={() => setShowPromptInput(!showPromptInput)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 h-9 text-sm font-medium"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI Generate
                </Button>
              </div>
              
              {/* AI Template Prompt Input */}
              {showPromptInput && (
                <div className="space-y-3 p-4 bg-primary-light border border-primary/20 rounded-lg">
                  <Label className="text-sm font-medium text-primary">
                    Describe the email you want to generate:
                  </Label>
                  <Textarea
                    placeholder="e.g., Introduce our new product to potential customers..."
                    rows={3}
                    value={templatePrompt}
                    onChange={(e) => setTemplatePrompt(e.target.value)}
                    className="border border-primary/30 focus:border-primary bg-background resize-none"
                  />
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={handleCreateMailTemplate}
                      disabled={isGeneratingTemplate || !templatePrompt.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 h-9 text-sm"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      {isGeneratingTemplate ? 'Generating...' : 'Generate'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPromptInput(false);
                        setTemplatePrompt('');
                      }}
                      className="px-4 py-2 h-9 text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <Textarea
                id="message"
                placeholder="Write your message here..."
                rows={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border border-border focus:border-primary bg-background resize-none"
              />
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <Label htmlFor="attachments" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-primary" />
                Attachments (Optional)
              </Label>
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                className="h-12 border-dashed border border-border focus:border-primary bg-background file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-sm"
              />
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded border border-border">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-primary" />
                        <div>
                          <span className="text-sm font-medium text-foreground">{file.name}</span>
                          <p className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSending}
                className="px-6 py-2 h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={isSending || !selectedSender || !subject || !message}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 h-10"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending...' : `Send to ${selectedLeads.size} Lead${selectedLeads.size > 1 ? 's' : ''}`}
              </Button>
            </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};