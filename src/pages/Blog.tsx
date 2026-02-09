import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const posts = [
    {
      title: "Maximizing Productivity with AI Prompts",
      date: "Oct 24, 2025",
      excerpt: "Learn how to structure your prompts to get the best results from LLMs and save them for future use.",
      category: "Productivity"
    },
    {
      title: "The Art of Code Snippet Management",
      date: "Oct 10, 2025",
      excerpt: "Why keeping a well-organized library of code snippets can double your coding speed.",
      category: "Development"
    },
    {
      title: "Vault Vibe Extension 2.0 Released",
      date: "Sep 28, 2025",
      excerpt: "Introducing new features: Cloud sync, team workspaces, and improved search capabilities.",
      category: "Product News"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="font-bold text-xl text-gray-900">Blog</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest Updates</h1>
            <p className="text-gray-600">Thoughts on development, productivity, and the future of coding.</p>
          </div>

          <div className="space-y-12">
            {posts.map((post, index) => (
              <motion.article 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="bg-violet-50 text-violet-700 px-3 py-1 rounded-full font-medium">{post.category}</span>
                  <span>{post.date}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <div className="text-violet-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                  Read more <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Blog;
