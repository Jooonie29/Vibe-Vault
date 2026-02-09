import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="font-bold text-xl text-gray-900">About Us</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Building the Future of Developer Productivity</h1>
            <p className="text-xl text-gray-600">
              We're on a mission to help developers organize their digital brain and flow state.
            </p>
          </div>

          <div className="prose prose-violet max-w-none">
            <p>
              Vault Vibe was born from a simple frustration: developers spend too much time searching for that one code snippet 
              they wrote three months ago, or that perfect AI prompt that generated amazing results.
            </p>
            <p>
              We believe that your personal infrastructure shouldn't be scattered across browser history, random text files, 
              and forgotten bookmarks. It should be centralized, searchable, and instantly accessible.
            </p>
            
            <h3>Our Values</h3>
            <ul>
              <li><strong>Simplicity:</strong> Tools should get out of the way.</li>
              <li><strong>Speed:</strong> Performance is a feature.</li>
              <li><strong>Privacy:</strong> Your data is yours.</li>
              <li><strong>Community:</strong> We build better together.</li>
            </ul>

            <h3>The Team</h3>
            <p>
              We are a small, passionate team of developers, designers, and productivity nerds. 
              We build tools that we want to use every day.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AboutUs;
