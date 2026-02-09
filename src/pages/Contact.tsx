import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, Send, CheckCircle2, MessageSquare, Twitter, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white selection:bg-violet-100 selection:text-violet-900">
      <Helmet>
        <title>Contact Us - Vault Vibe</title>
        <meta name="description" content="Get in touch with the Vault Vibe team. We're here to help with support, feedback, and inquiries." />
      </Helmet>
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="font-bold text-xl text-gray-900">Contact Us</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div>
              <span className="text-violet-600 font-bold tracking-wider uppercase text-sm mb-4 block">Get in touch</span>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                Let's start a <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Conversation</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Have questions about Vault Vibe? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center shrink-0 border border-violet-100 group-hover:scale-110 transition-transform shadow-sm">
                  <Mail className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600 mb-2">For general inquiries and support</p>
                  <a href="mailto:support@vaultvibe.com" className="text-violet-600 font-medium hover:underline">support@vaultvibe.com</a>
                </div>
              </div>
              
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center shrink-0 border border-violet-100 group-hover:scale-110 transition-transform shadow-sm">
                  <MapPin className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-1">Office</h3>
                  <p className="text-gray-600 mb-2">Come say hello at our HQ</p>
                  <p className="text-gray-900 font-medium">123 Innovation Dr, Tech City, TC 94043</p>
                </div>
              </div>

               <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center shrink-0 border border-violet-100 group-hover:scale-110 transition-transform shadow-sm">
                  <MessageSquare className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-1">Live Chat</h3>
                  <p className="text-gray-600 mb-2">Available Mon-Fri, 9am-5pm PST</p>
                  <button className="text-violet-600 font-medium hover:underline">Start a chat</button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Decorative BG Blob */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-100 to-indigo-50 rounded-[2.5rem] transform rotate-3 -z-10" />

            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100 h-full">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600 text-lg">Thanks for reaching out. We'll get back to you shortly.</p>
                  </div>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email</label>
                      <input 
                        type="email" 
                        required
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Subject</label>
                    <select className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-gray-600">
                        <option>General Inquiry</option>
                        <option>Support</option>
                        <option>Feedback</option>
                        <option>Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Message</label>
                    <textarea 
                      required
                      rows={5}
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-all"
                      placeholder="How can we help?"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-violet-600 text-white font-bold py-4 rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 group"
                  >
                    <span>Send Message</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
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
            <Link to="/contact" className="hover:text-violet-600 transition-colors text-violet-600 font-medium">Contact</Link>
            <Link to="/privacy" className="hover:text-violet-600 transition-colors">Privacy</Link>
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

export default Contact;
