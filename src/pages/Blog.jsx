import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, BookOpen, Tag, X, ChevronDown, ChevronUp } from 'lucide-react';
import BlogCard from '../components/ui/BlogCard';
import { useBlogPosts } from '../hooks/useSiteData';

const TAG_LIMIT = 6;

export default function Blog() {
  const { posts: blogPosts } = useBlogPosts();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [showAllTags, setShowAllTags] = useState(false);

  const allTags = ['all', ...new Set(blogPosts.flatMap(p => p.tags ? p.tags.split(',').map(t => t.trim()) : []))];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const postTags = post.tags ? post.tags.split(',').map(t => t.trim()) : [];
    const matchesTag = activeTag === 'all' || postTags.includes(activeTag);

    return matchesSearch && matchesTag;
  });

  return (
    <>
      <Helmet>
        <title>Blog — Navkar Engineering</title>
        <meta name="description" content="Read the latest articles on pneumatics, hydraulics, instrumentation, compressed air systems & clean energy from Navkar Engineering" />
      </Helmet>

      <div>
        {/* Header */}
        <section className="section-padding bg-white dark:bg-gray-950 relative overflow-hidden border-b border-[var(--color-border)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="container-wide relative">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <p className="badge-blue mb-5">Our Blog</p>
              <h1 className="heading-display text-[clamp(2rem,4vw,3.5rem)] text-gray-900 dark:text-white mb-4">
                Insights &<br />
                <span className="text-gradient">Industry Updates</span>
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                Technical guides, product highlights, industry news, and more from the Navkar Engineering team.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filter bar */}
        <div className="sticky top-[72px] z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-[var(--color-border)]">
          <div className="container-wide py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 py-2.5 text-sm"
              />
            </div>

            {/* Tags */}
            {allTags.length > 1 && (() => {
              const visibleTags = showAllTags ? allTags : allTags.slice(0, TAG_LIMIT);
              // Always include active tag even if beyond limit
              const displayTags = (showAllTags || visibleTags.includes(activeTag))
                ? visibleTags
                : [...visibleTags.slice(0, TAG_LIMIT - 1), activeTag];
              const hasMore = allTags.length > TAG_LIMIT;

              return (
                <div className="flex gap-2 flex-wrap items-center">
                  {displayTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        activeTag === tag
                          ? 'bg-accent text-white shadow-glow'
                          : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-accent/40'
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      {tag === 'all' ? 'All' : tag}
                      {activeTag === tag && activeTag !== 'all' && (
                        <X className="w-3 h-3 ml-0.5" onClick={(e) => { e.stopPropagation(); setActiveTag('all'); }} />
                      )}
                    </button>
                  ))}
                  {hasMore && (
                    <button
                      onClick={() => setShowAllTags((v) => !v)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-accent/50 text-accent hover:bg-accent/10 transition-all duration-200"
                    >
                      {showAllTags ? (
                        <><ChevronUp className="w-3 h-3" /> View Less</>
                      ) : (
                        <><ChevronDown className="w-3 h-3" /> +{allTags.length - TAG_LIMIT} More</>
                      )}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Blog grid */}
        <section className="section-padding">
          <div className="container-wide">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredPosts.length}</span> articles
              </p>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No articles found</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveTag('all'); }}
                  className="mt-4 text-accent text-sm hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id || post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <BlogCard post={post} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}