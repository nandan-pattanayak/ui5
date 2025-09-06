import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Users, 
  TrendingUp, 
  Zap, 
  Shield, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Database,
  Search,
  UserCheck,
  Brain,
  Rocket,
  Eye,
  Globe,
  LineChart,
  Award
} from 'lucide-react';
import LeadEnrichmentFlow from '@/components/flow/LeadEnrichmentFlow';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Marketing Intelligence",
      description: "Leverage advanced AI to discover high-intent prospects and uncover market opportunities with precision"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Smart Contact Enrichment",
      description: "Automatically enrich contact profiles with comprehensive business intelligence and verified information"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Competitive Intelligence",
      description: "Monitor competitors, analyze market positioning, and identify strategic opportunities in real-time"
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Advanced Analytics Dashboard",
      description: "Make data-driven decisions with comprehensive performance metrics and predictive insights"
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Automated Lead Nurturing",
      description: "Scale your outreach with intelligent automation and personalized engagement sequences"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Bank-level security with GDPR compliance and SOC 2 Type II certification for data protection"
    }
  ];

  const stats = [
    { number: "50M+", label: "Global Contacts", icon: <Globe className="h-4 w-4" /> },
    { number: "2M+", label: "Companies Tracked", icon: <Users className="h-4 w-4" /> },
    { number: "98%", label: "Data Accuracy", icon: <Award className="h-4 w-4" /> },
    { number: "24/7", label: "AI Support", icon: <Zap className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-soft rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">MarkAssist by TaskForge</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/register')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 animate-pulse">
            <Brain className="h-3 w-3 mr-1" />
            AI-Powered Marketing Intelligence
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-primary-soft to-secondary bg-clip-text text-transparent animate-fade-in">
              Describe Your Product.
            </span>
            <span className="block text-foreground">
              MarkAssist Finds Your Customers.
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Simply describe what you offer, and our AI-powered platform will discover, enrich, and deliver 
            qualified leads ready to convert. Transform product descriptions into revenue-generating customers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg group"
            >
              Create Account - Get 30 Free Credits
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="px-8 py-4 text-lg border-border hover:bg-accent"
            >
              Sign In
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300 border-border/50">
                <div className="flex items-center justify-center mb-3 text-primary">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Enrichment Flow */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How MarkAssist Finds Your Perfect Customers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch how our intelligent system transforms your product description into qualified, 
              ready-to-convert leads in seconds.
            </p>
          </div>
          
          <LeadEnrichmentFlow />
          
          <div className="mt-12 text-center">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="glass-card p-6 border-border/50">
                <div className="text-2xl font-bold text-primary mb-2">2 Seconds</div>
                <div className="text-sm text-muted-foreground">Average processing time</div>
              </div>
              <div className="glass-card p-6 border-border/50">
                <div className="text-2xl font-bold text-primary mb-2">98% Accuracy</div>
                <div className="text-sm text-muted-foreground">Lead quality verification</div>
              </div>
              <div className="glass-card p-6 border-border/50">
                <div className="text-2xl font-bold text-accent-foreground mb-2">4x Higher</div>
                <div className="text-sm text-muted-foreground">Conversion rates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-secondary/10 text-secondary border-secondary/20">
              <Rocket className="h-3 w-3 mr-1" />
              Comprehensive Platform
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Complete Marketing Intelligence Suite
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From prospect discovery to competitive analysis, our AI-powered platform 
              provides everything you need to dominate your market and accelerate growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card border-border/50 hover:border-primary/50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-secondary/10 text-secondary border-secondary/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                Proven Results
              </Badge>
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Supercharge Your Marketing ROI
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8">
                Join 10,000+ marketing teams who have transformed their growth strategy 
                with MarkAssist's intelligent marketing platform. See real results in weeks, not months.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Boost lead quality and conversion rates by 400%",
                  "Cut market research time from weeks to hours",
                  "Identify competitor weaknesses and opportunities",
                  "Automate personalized outreach at scale",
                  "Track ROI with real-time analytics",
                  "Integrate seamlessly with your existing tools"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 group">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-foreground group-hover:text-primary transition-colors">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Get Started Today
              </Button>
            </div>
            
            <div className="relative">
              <div className="glass-card p-8 border-border/50">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">Active Campaigns</span>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Live</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-primary-soft w-3/4 rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">75%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center group cursor-pointer">
                      <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">2,847</div>
                      <div className="text-sm text-muted-foreground">Qualified Leads</div>
                    </div>
                    <div className="text-center group cursor-pointer">
                      <div className="text-2xl font-bold text-secondary group-hover:scale-110 transition-transform">94%</div>
                      <div className="text-sm text-muted-foreground">AI Accuracy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Target className="h-3 w-3 mr-1" />
            Start Your Growth Journey
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Dominate Your Market?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 10,000+ marketing professionals already using MarkAssist to outperform 
            competitors and accelerate business growth. Start your free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg"
            >
              Create Account - Get 30 Free Credits
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="px-8 py-4 text-lg border-border hover:bg-accent"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-soft rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">MarkAssist by TaskForge</span>
            </div>
            
            <div className="text-muted-foreground text-center md:text-right">
              <p>&copy; 2024 MarkAssist. All rights reserved.</p>
              <p className="text-sm mt-1">AI-Powered Marketing Intelligence Platform</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;