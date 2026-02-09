import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, FileText, Twitter, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-violet-100 selection:text-violet-900">
      <Helmet>
        <title>Privacy Policy - Vault Vibe</title>
        <meta name="description" content="Read our Privacy Policy to understand how Vault Vibe collects, uses, and protects your personal data." />
      </Helmet>
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="font-bold text-xl text-gray-900">Privacy Policy</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            We value your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">privacy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your data is yours. We are committed to protecting your personal information and being transparent about how we use it.
          </p>
          <p className="mt-4 text-sm text-gray-400 font-medium uppercase tracking-wider">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        {/* Content */}
        <div className="grid md:grid-cols-[1fr_250px] gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-lg prose-violet max-w-none"
          >
            <section className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <span className="text-violet-600 text-sm font-bold">1</span>
                </div>
                Introduction
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Welcome to Vault Vibe. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our website 
                or use our browser extension and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <span className="text-violet-600 text-sm font-bold">2</span>
                </div>
                Data We Collect
              </h2>
              <p className="text-gray-600 mb-4">
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 not-prose">
                {[
                  { title: "Identity Data", desc: "First name, last name, username", icon: FileText },
                  { title: "Contact Data", desc: "Email address", icon: Eye },
                  { title: "Technical Data", desc: "IP address, browser type, device info", icon: Lock },
                  { title: "Usage Data", desc: "How you use our website & services", icon: Shield },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className="w-4 h-4 text-violet-600" />
                      <span className="font-bold text-gray-900 text-sm">{item.title}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <span className="text-violet-600 text-sm font-bold">3</span>
                </div>
                How We Use Your Data
              </h2>
              <p className="text-gray-600 mb-4">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="space-y-2 text-gray-600 marker:text-violet-500">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                <li>Where we need to comply with a legal or regulatory obligation.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <span className="text-violet-600 text-sm font-bold">4</span>
                </div>
                Data Security
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <span className="text-violet-600 text-sm font-bold">5</span>
                </div>
                Contact Us
              </h2>
              <div className="bg-violet-50 rounded-2xl p-6 border border-violet-100">
                <p className="text-gray-900 font-medium mb-2">Have questions about our privacy practices?</p>
                <p className="text-gray-600 mb-4">We're here to help.</p>
                <a href="mailto:privacy@vaultvibe.com" className="inline-flex items-center justify-center px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors">
                  Contact Privacy Team
                </a>
              </div>
            </section>
          </motion.div>

          {/* Table of Contents Sticky Sidebar */}
          <div className="hidden md:block">
            <div className="sticky top-24">
              <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Contents</h4>
              <nav className="space-y-1">
                {["Introduction", "Data We Collect", "How We Use Data", "Data Security", "Contact Us"].map((item, i) => (
                  <a 
                    key={item} 
                    href="#" 
                    className={`block text-sm py-2 px-3 rounded-lg transition-colors ${i === 0 ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Vault Vibe" className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl text-gray-900 tracking-tight">Vault Vibe</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <Link to="/about" className="hover:text-violet-600 transition-colors">About</Link>
            <Link to="/blog" className="hover:text-violet-600 transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-violet-600 transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-violet-600 transition-colors text-violet-600 font-medium">Privacy</Link>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
