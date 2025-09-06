import React from 'react';
import { 
  Search,
  Zap,
  Users,
  Target,
  CheckCircle,
  Brain
} from 'lucide-react';

const LeadEnrichmentFlow = () => {
  const steps = [
    {
      id: 1,
      title: 'Product Description',
      subtitle: 'Simply describe what you offer',
      example: '"B2B SaaS tool for project management with team collaboration features"',
      icon: <Search className="h-6 w-6 text-white" />,
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      title: 'AI Processing',
      subtitle: 'Our AI analyzes and discovers leads',
      details: 'Semantic analysis • Company matching • Contact discovery',
      icon: <Zap className="h-6 w-6 text-white" />,
      bgGradient: 'from-blue-600 to-blue-700'
    },
    {
      id: 3,
      title: 'Qualified Leads Found',
      subtitle: 'Ready-to-convert prospects delivered',
      result: '147 Leads',
      description: 'Enriched with contact data & fit scores',
      accuracy: '98% Accuracy',
      icon: <Users className="h-6 w-6 text-white" />,
      bgGradient: 'from-blue-700 to-blue-800'
    }
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-3 rounded-full border border-primary/20 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-primary font-semibold">AI Lead Discovery</span>
        </div>
      </div>

      {/* Flow Container with gradient background */}
      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200 shadow-lg">
        
        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Step Card */}
              <div className="relative bg-white rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 shadow-sm">
                
                {/* Step Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${step.bgGradient} shadow-lg`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{step.title}</h3>
                    <p className="text-blue-600 text-sm">{step.subtitle}</p>
                  </div>
                  <div className="text-xs text-white font-medium px-3 py-1 bg-blue-500 rounded-full">
                    {step.id}
                  </div>
                </div>

                {/* Step Content */}
                <div className="ml-16">
                  {step.example && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                      <p className="text-blue-700 italic text-sm">{step.example}</p>
                    </div>
                  )}
                  
                  {step.details && (
                    <p className="text-blue-600 text-sm font-medium">{step.details}</p>
                  )}
                  
                  {step.result && (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">{step.result}</div>
                        <p className="text-blue-600 text-sm">{step.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-700">{step.accuracy}</div>
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-4">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-blue-300 to-blue-400"></div>
                  <div className="absolute w-2 h-2 bg-blue-500 rounded-full -mt-1 animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 pt-6 border-t border-blue-200">
          <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
            <Target className="h-4 w-4" />
            <span>Average processing time: 2 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadEnrichmentFlow;