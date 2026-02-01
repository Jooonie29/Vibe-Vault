import { useState } from 'react';
import { Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PricingModalProps {
  children: React.ReactNode;
}

export function PricingModal({ children }: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: "Perfect for getting started with personal projects.",
      features: [
        '3 Workspaces',
        '200MB Storage',
        'Community Support',
        'Basic Analytics',
        'Single User'
      ],
      buttonText: 'Current Plan',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$12',
      period: '/month',
      description: 'Unlock unlimited potential for growing teams.',
      features: [
        'Unlimited Workspaces',
        'Unlimited Storage',
        'Priority Support',
        'Advanced Analytics',
        'Team Collaboration',
        'Custom Domains'
      ],
      buttonText: 'Upgrade to Pro',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      title: "Custom",
      description: "Tailored solutions for large organizations.",
      features: [
        'Dedicated Support',
        'SSO & Security',
        'Custom Contracts',
        'SLA Guarantee',
        'Onboarding Training'
      ],
      buttonText: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw] p-6 bg-[#FDFBFF] border-none shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex flex-col items-center text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Upgrade your workspace</h2>
          <p className="text-gray-500 max-w-lg text-sm">
            Choose the plan that fits your needs. Scale as you grow.
          </p>

          <div className="mt-4 flex items-center gap-0 bg-white p-1 rounded-full shadow-sm border border-gray-100 scale-90 origin-center">
            <button 
              className={cn(
                "px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-300", 
                billingCycle === 'monthly' ? "bg-violet-600 text-white shadow-md" : "text-gray-500 hover:text-gray-900"
              )} 
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button 
              className={cn(
                "px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-300", 
                billingCycle === 'quarterly' ? "bg-white text-gray-900" : "text-gray-500 hover:text-gray-900"
              )} 
              onClick={() => setBillingCycle('quarterly')}
            >
              Quarterly (-10%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-2xl p-5 flex flex-col h-full transition-all duration-300",
                plan.highlighted
                  ? "bg-gradient-to-b from-violet-50 to-white border border-violet-100 shadow-xl scale-105 z-10"
                  : "bg-white border border-gray-100 shadow-md hover:shadow-lg scale-100"
              )}
            >
              <div className="mb-3">
                 <span className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider",
                    plan.highlighted ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600"
                 )}>
                    {plan.name}
                 </span>
              </div>

              <div className="mb-2 min-h-[32px] flex items-end">
                {plan.title ? (
                     <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{plan.title}</h3>
                ) : (
                    <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900 tracking-tight">{plan.price}</span>
                        <span className="text-gray-500 ml-1 text-xs font-medium">{plan.period}</span>
                    </div>
                )}
              </div>

              <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-grow font-medium">
                {plan.description}
              </p>

              <div className="space-y-2.5 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check className={cn("w-3.5 h-3.5 flex-shrink-0 mt-0.5", plan.highlighted ? "text-violet-600" : "text-gray-400")} strokeWidth={3} />
                    <span className="text-xs text-gray-700 font-semibold">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-xs transition-all active:scale-95",
                  plan.highlighted
                    ? "bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200"
                    : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm"
                )}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
