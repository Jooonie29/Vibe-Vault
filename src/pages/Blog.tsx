import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, User, Tag, Twitter, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const posts = [
    {
      title: "Maximizing Productivity with AI Prompts",
      date: "Oct 24, 2025",
      author: "Alex Chen",
      excerpt: "Learn how to structure your prompts to get the best results from LLMs and save them for future use. We dive deep into context management and prompt chaining.",
      category: "Productivity",
      image: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "The Art of Code Snippet Management",
      date: "Oct 10, 2025",
      author: "Sarah Jones",
      excerpt: "Why keeping a well-organized library of code snippets can double your coding speed. Strategies for tagging, naming, and retrieving your assets.",
      category: "Development",
      image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Vault Vibe Extension 2.0 Released",
      date: "Sep 28, 2025",
      author: "Team Vibe",
      excerpt: "Introducing new features: Cloud sync, team workspaces, and improved search capabilities. See what's new in our biggest update yet.",
      category: "Product News",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-violet-100 selection:text-violet-900">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="font-bold text-xl text-gray-900">Blog</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="text-violet-600 font-bold tracking-wider uppercase text-sm mb-4 block">The Vibe Log</span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Updates</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thoughts on development, productivity, and the future of coding.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300"
            >
              {/* Image */}
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-violet-900/10 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 z-20">
                    <span className="bg-white/90 backdrop-blur-sm text-violet-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                        {post.category}
                    </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {post.author}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors leading-tight">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-violet-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                    Read Article <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 bg-[#0A0C14] rounded-3xl p-12 text-center relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-4">Subscribe to our newsletter</h2>
                <p className="text-gray-400 mb-8">Get the latest productivity tips and product updates delivered straight to your inbox.</p>
                
                <form className="flex flex-col sm:flex-row gap-4">
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="flex-1 px-6 py-3.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    />
                    <button className="px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-500/20">
                        Subscribe
                    </button>
                </form>
            </div>
        </motion.div>
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
            <Link to="/blog" className="hover:text-violet-600 transition-colors text-violet-600 font-medium">Blog</Link>
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

export default Blog;
