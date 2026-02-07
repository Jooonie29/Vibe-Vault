import React from 'react';
import { Search, HelpCircle, FileQuestion, MessageCircle, Book, ChevronRight } from 'lucide-react';

export const HelpCenter = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="text-center py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">How can we help you?</h1>
        <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
                type="text" 
                placeholder="Search for articles, guides, and troubleshooting..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 shadow-sm focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none text-gray-900 transition-all"
            />
        </div>
      </div>

      {/* Quick Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CategoryCard icon={Book} title="Getting Started" />
        <CategoryCard icon={FileQuestion} title="Account & Billing" />
        <CategoryCard icon={HelpCircle} title="Troubleshooting" />
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-gray-100">
            <FAQItem 
                question="How do I export my data?" 
                answer="You can export all your prompts and code snippets from the Settings > Data Management page. We support JSON and Markdown formats."
            />
            <FAQItem 
                question="What happens when my free trial ends?" 
                answer="Your account will be downgraded to the Free plan. You will keep all your data, but some limits on storage and workspaces will apply."
            />
            <FAQItem 
                question="Can I invite team members?" 
                answer="Yes! You can invite team members from the Workspace Settings. The Free plan allows up to 3 members per workspace."
            />
            <FAQItem 
                question="How do I reset my password?" 
                answer="Go to the login page and click 'Forgot Password'. We'll send you a secure link to reset it."
            />
        </div>
      </div>

      {/* Contact Support CTA */}
      <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between border border-gray-200">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <MessageCircle className="w-6 h-6 text-violet-600" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">Still need help?</h3>
                <p className="text-sm text-gray-500">Our support team is just a message away.</p>
            </div>
        </div>
        <button className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors">
            Contact Support
        </button>
      </div>
    </div>
  );
};

const CategoryCard = ({ icon: Icon, title }: any) => (
    <button className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-violet-300 hover:shadow-md transition-all group text-left">
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-violet-50 transition-colors">
            <Icon className="w-5 h-5 text-gray-500 group-hover:text-violet-600" />
        </div>
        <span className="font-semibold text-gray-700 group-hover:text-gray-900">{title}</span>
    </button>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
        <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900 group-hover:text-violet-700">{question}</h3>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-transform group-hover:translate-x-1" />
        </div>
        <p className="text-sm text-gray-500 leading-relaxed max-w-3xl">{answer}</p>
    </div>
);
