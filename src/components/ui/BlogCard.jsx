import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function BlogCard({ post, index = 0 }) {
  // Support both API format (image, created_at, tags as string) and static format (cover, date, tags as array)
  const coverSrc = post.image || post.cover || '';
  const rawDate = post.created_at || post.date || null;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  // Tags can be a comma-separated string (from DB) or an array (from static data)
  const tagsArray = Array.isArray(post.tags)
    ? post.tags
    : (post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : []);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group card overflow-hidden flex flex-col h-full hover:shadow-card-hover transition-all duration-300"
      >
        {/* Cover image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={coverSrc}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = `https://placehold.co/800x450/1e293b/64748b?text=${encodeURIComponent((post.title || 'Blog').substring(0, 40))}`;
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6">
          {/* Tags */}
          {tagsArray.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tagsArray.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent dark:bg-accent/20 uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
              {tagsArray.length > 2 && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  +{tagsArray.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-2 group-hover:text-accent transition-colors duration-200">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1 line-clamp-3">
            {post.excerpt}
          </p>

          {/* Meta and CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
              {formattedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
              )}
              {post.readTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0">
              Read <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}