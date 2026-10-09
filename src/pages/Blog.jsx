
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Clock, User, Tag, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBlogPosts } from '../hooks/useSiteData';
import CTASection from '../components/sections/CTASection';

export default function Blog() {
  const { posts: blogPosts } = useBlogPosts();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  // Extract all unique tags from posts
  const allTags = useMemo(() => {
    const tags = new Set();
    blogPosts.forEach(post => {
      if (post.tags) {
        post.tags.split(',').forEach(t => tags.add(t.trim()));
      }
    });
    return ['All', ...Array.from(tags)];
  }, [blogPosts]);

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
    const postTags = post.tags ? post.tags.split(',').map(t => t.trim()) : [];
    const matchesTag = activeTag === 'All' || postTags.includes(activeTag);
    
    return matchesSearch && matchesTag;
  });

  return (
    <div className="bg-gray-50 overflow-hidden">
      
      {/* HEADER */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex flex-col justify-center items-center bg-[#050505]">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero/slide-2.jpg" alt="Blog" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020512] via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 mt-16 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Industry <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-blue-500">Insights</span>
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
              Expert articles, technical guides, and the latest news in compressed air and fluid power systems.
            </p>
          </motion.div>
        </div>
      </section>

      {/* BLOG GRID */}
      <section className="py-20 relative bg-transparent -mt-16 z-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Controls: Search Bar & Tag Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="mb-12 flex flex-col gap-6"
          >
            {/* Search */}
            <div className="bg-white border border-gray-100 p-4 rounded-full shadow-xl flex items-center w-full max-w-xl mx-auto">
              <Search className="w-5 h-5 text-gray-400 ml-4 mr-2" />
              <input 
                type="text" 
                placeholder="Search articles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400" 
              />
            </div>
            
            {/* Tag Cloud */}
            <div className="flex flex-nowrap items-center gap-3 max-w-4xl mx-auto mt-2 overflow-x-auto scrollbar-hide pb-4 px-2 w-full">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-2 shrink-0 whitespace-nowrap"><Filter className="w-4 h-4" /> Filter by Tag:</span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${activeTag === tag ? 'bg-[#0a1a5c] text-white shadow-md border border-[#0a1a5c]' : 'bg-white text-gray-600 border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-gray-300 hover:text-[#00b4d8]'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, i) => {
              const postTags = post.tags ? post.tags.split(',').map(t => t.trim()) : [];
              return (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 50 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 }} 
                  viewport={{ once: true, margin: "-50px" }}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 group hover:-translate-y-2 transition-all duration-300 flex flex-col"
                >
                  <Link to={`/blog/${post.slug}`} className="h-56 overflow-hidden relative block">
                    <img src={post.cover} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-80" />
                  </Link>
                  
                  {/* Floating tags on image */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                    {postTags.map(tag => (
                      <span key={tag} className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg">
                        <Tag className="w-2.5 h-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#00b4d8] transition-colors line-clamp-2 leading-snug">{post.title}</h3>
                    </Link>
                    <p className="text-gray-500 font-light mb-6 line-clamp-3">{post.excerpt}</p>
                    
                    <div className="mt-auto">
                      <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-[#0a1a5c] font-bold uppercase tracking-widest text-sm group-hover:text-[#00b4d8] transition-colors">
                        Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20 text-gray-500 bg-white rounded-3xl shadow-sm border border-gray-100">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
              <p>We couldn't find any articles matching your search or selected tag.</p>
              <button onClick={() => {setSearchQuery(''); setActiveTag('All');}} className="mt-6 text-[#00b4d8] font-bold uppercase tracking-widest text-sm hover:underline">
                Clear Filters
              </button>
            </div>
          )}

        </div>
      </section>

      <CTASection />
    </div>
  );
}
