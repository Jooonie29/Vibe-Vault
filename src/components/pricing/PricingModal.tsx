import { useState } from 'react';
import { Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { SignedIn, ClerkLoaded } from '@clerk/clerk-react';
import { CheckoutProvider } from '@clerk/clerk-react/experimental';
import { CheckoutDrawer } from './CheckoutDrawer';

interface PricingModalProps {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
}

export function PricingModal({ children, trigger }: PricingModalProps) {
  const [open, setOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');

  const triggerElement = trigger || children;

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: "Perfect for getting started with personal projects.",
      features: [
        '3 Workspaces',
        '200MB Storage',
        'Unlimited Code Snippets',
        'Unlimited AI Prompts',
        'Community Support'
      ],
      buttonText: 'Current Plan',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$5',
      period: '/month',
      description: 'Unlock unlimited potential for growing teams.',
      features: [
        'Unlimited Workspaces',
        '10GB Storage',
        'Cloud Backup & Sync',
        'Advanced Search & Filtering',
        'Unlimited AI Prompts',
        'Unlimited Code Snippets',
        'Priority Support',
        'Shareable Links'
      ],
      buttonText: 'Upgrade to Pro',
      highlighted: true,
    }
  ];

  const handleUpgradeClick = () => {
    setOpen(false);
    setCheckoutOpen(true);
  };

  const proPlan = plans.find(p => p.name === 'Pro')!;
  const isAnnual = billingCycle === 'quarterly';
  const monthlyPrice = 5;
  const annualMonthlyPrice = 4.50;
  const annualTotal = annualMonthlyPrice * 12;
  const annualSavings = (monthlyPrice - annualMonthlyPrice) * 12;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{triggerElement}</DialogTrigger>
        <DialogContent className="max-w-5xl w-[95vw] p-6 bg-[#FDFBFF] dark:bg-[#0a0a0f] border-none shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col items-center text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Upgrade your workspace</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg text-sm">
              Choose the plan that fits your needs. Scale as you grow.
            </p>

            <div className="mt-4 flex items-center gap-0 bg-white dark:bg-white/5 p-1 rounded-full shadow-sm border border-gray-100 dark:border-white/10 scale-90 origin-center">
              <button 
                className={cn(
                  "px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-300", 
                  billingCycle === 'monthly' ? "bg-violet-600 text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )} 
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button 
                className={cn(
                  "px-6 py-1.5 rounded-full text-xs font-bold transition-all duration-300", 
                  billingCycle === 'quarterly' ? "bg-white dark:bg-white text-gray-900" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )} 
                onClick={() => setBillingCycle('quarterly')}
              >
                Quarterly (-10%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "rounded-3xl p-8 flex flex-col h-full transition-all duration-300",
                  plan.highlighted
                    ? "bg-violet-50 dark:bg-violet-900/10 border-2 border-violet-500 shadow-xl z-10"
                    : "bg-white dark:bg-card border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md"
                )}
              >
                <div className="mb-6">
                   <span className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                      plan.highlighted 
                        ? "bg-violet-600 text-white" 
                        : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                   )}>
                      {plan.name}
                   </span>
                </div>

                <div className="mb-4 min-h-[40px] flex items-end">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">{plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2 text-base font-medium">{plan.period}</span>
                  </div>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 font-medium">
                  {plan.description}
                </p>

                <div className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                        plan.highlighted ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                      )}>
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.name === 'Pro' ? (
                  <SignedIn>
                    <button
                      onClick={handleUpgradeClick}
                      className={cn(
                        "w-full py-3 rounded-xl font-bold text-xs transition-all active:scale-95",
                        "bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
                      )}
                    >
                      {plan.buttonText}
                    </button>
                  </SignedIn>
                ) : (
                  <button
                    className={cn(
                      "w-full py-3 rounded-xl font-bold text-xs transition-all active:scale-95",
                      plan.highlighted
                        ? "bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
                        : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm"
                    )}
                  >
                    {plan.buttonText}
                  </button>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Checkout Drawer */}
      <ClerkLoaded>
        <SignedIn>
          <CheckoutProvider
            for="user"
            planId="cplan_39IDnSQQbze6jNELLRKP4tXpcLT"
            planPeriod={isAnnual ? 'annual' : 'month'}
          >
            <CheckoutDrawer
              isOpen={checkoutOpen}
              onClose={() => setCheckoutOpen(false)}
              planId="cplan_39IDnSQQbze6jNELLRKP4tXpcLT"
              planPeriod={isAnnual ? 'annual' : 'month'}
              planName={proPlan.name}
              planPrice={isAnnual ? `$${annualMonthlyPrice.toFixed(2)}/month` : `$${monthlyPrice.toFixed(2)}/month`}
              planDescription={proPlan.description}
              monthlyPrice={isAnnual ? annualMonthlyPrice : monthlyPrice}
              isAnnual={isAnnual}
              annualTotal={isAnnual ? annualTotal : undefined}
              annualSavings={isAnnual ? annualSavings : undefined}
            />
          </CheckoutProvider>
        </SignedIn>
      </ClerkLoaded>
    </>
  );
}
