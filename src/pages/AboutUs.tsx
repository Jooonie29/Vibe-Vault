import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Zap, Shield, Heart, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-violet-100 selection:text-violet-900">
      <Helmet>
        <title>About Us - Vault Vibe</title>
        <meta name="description" content="We're on a mission to help developers organize their digital brain. Learn more about Vault Vibe, our values, and the team behind the tool." />
      </Helmet>
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="font-bold text-xl text-gray-900">About Us</div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
           {/* Decorative Elements */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-100/30 rounded-full blur-3xl -z-10" />
           
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <span className="text-violet-600 font-bold tracking-wider uppercase text-sm mb-4 block">Our Mission</span>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
              Building the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Future</span> of Developer Productivity
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              We're on a mission to help developers organize their digital brain and maintain their flow state.
            </p>
          </motion.div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-gray-50 border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Born from Frustration</h2>
                <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                  <p>
                    Vault Vibe was born from a simple frustration: developers spend too much time searching for that one code snippet 
                    they wrote three months ago, or that perfect AI prompt that generated amazing results.
                  </p>
                  <p>
                    We believe that your personal infrastructure shouldn't be scattered across browser history, random text files, 
                    and forgotten bookmarks. It should be centralized, searchable, and instantly accessible.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-3xl transform rotate-3 opacity-20" />
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Team collaboration" 
                  className="rounded-3xl shadow-2xl relative z-10"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Grid */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Simplicity", desc: "Tools should get out of the way. We design for speed and clarity." },
              { icon: Shield, title: "Privacy", desc: "Your data is yours. We build with security first principles." },
              { icon: Users, title: "Community", desc: "We build better together. Open source at our core." },
              { icon: Heart, title: "Passion", desc: "We build tools that we actually want to use every day." },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 transition-all group"
              >
                <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <value.icon className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 bg-[#0A0C14] text-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Meet the Builders</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-16 text-lg">
              We are a small, passionate team of developers, designers, and productivity nerds.
            </p>
            
            <div className="flex justify-center gap-8">
                {/* Placeholder for team members - simplified for now */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 max-w-sm hover:bg-white/10 transition-colors">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">VV</div>
                    <h3 className="text-xl font-bold mb-1">Vault Vibe Team</h3>
                    <p className="text-violet-300 mb-4">Core Contributors</p>
                    <div className="flex justify-center gap-4">
                        <Github className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                        <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                        <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                    </div>
                </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Vault Vibe" className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl text-gray-900 tracking-tight">Vault Vibe</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <Link to="/about" className="hover:text-violet-600 transition-colors text-violet-600 font-medium">About</Link>
            <Link to="/blog" className="hover:text-violet-600 transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-violet-600 transition-colors">Contact</Link>
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

export default AboutUs;
