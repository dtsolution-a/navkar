import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, User, ArrowLeft, ArrowRight,
  ChevronRight, BookOpen, Share2, Link2,
} from 'lucide-react';
import { useState } from 'react';
import { useBlogPost, useBlogPosts } from '../hooks/useSiteData';
import BlogCard from '../components/ui/BlogCard';

// Simple markdown-like rendering (converts ##, ###, **bold**, lists, tables)
function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let inTable = false;
  let tableRows = [];
  let inCodeBlock = false;
  let codeLines = [];
  let inList = false;
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-2 my-4">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const flushCode = () => {
    if (codeLines.length > 0) {
      elements.push(
        <pre key={`code-${elements.length}`} className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-xl p-5 my-6 overflow-x-auto text-sm leading-relaxed">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      codeLines = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (!trimmed) {
      flushList();
      flushCode();
      return;
    }

    if (trimmed.startsWith('|---') || trimmed.startsWith('|---')) {
      return;
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      const cells = trimmed
        .split('|')
        .filter((c) => c.trim())
        .map((c) => c.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'));

      if (!inTable) {
        inTable = true;
        tableRows = [cells];
      } else {
        tableRows.push(cells);
      }
      return;
    }

    if (inTable) {
      if (tableRows.length >= 2) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60">
                  {tableRows[0].map((cell, ci) => (
                    <th key={ci} className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700" dangerouslySetInnerHTML={{ __html: cell }} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-3 text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: cell }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      inTable = false;
      tableRows = [];
      return;
    }

    const renderBold = (text) => {
      const parts = text.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, pi) =>
        pi % 2 === 1 ? <strong key={pi} className="font-semibold text-gray-900 dark:text-white">{part}</strong> : part
      );
    };

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">
          {trimmed.replace('### ', '').replace(/\*\*(.*?)\*\*/g, '$1')}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">
          {trimmed.replace('## ', '').replace(/\*\*(.*?)\*\*/g, '$1')}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.substring(2));
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      flushList();
      const numContent = trimmed.replace(/^\d+\.\s/, '');
      elements.push(
        <div key={`ol-${i}`} className="flex items-start gap-3 my-2 text-gray-600 dark:text-gray-300 leading-relaxed">
          <span className="mt-0.5 w-5 h-5 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
            {trimmed.match(/^\d+/)[0]}
          </span>
          <span>{renderBold(numContent)}</span>
        </div>
      );
      return;
    }

    flushList();

    elements.push(
      <p key={`p-${i}`} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
        {renderBold(trimmed)}
      </p>
    );
  });

  flushList();
  flushCode();

  return elements;
}

export default function BlogPost() {
  const { slug } = useParams();
  const { post } = useBlogPost(slug);
  const { posts: blogPosts } = useBlogPosts();
  const [copied, setCopied] = useState(false);

  // Related posts
  const relatedPosts = blogPosts
    .filter(p => p.slug !== slug)
    .slice(0, 3);

  if (!post) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-8xl font-black text-gray-100 dark:text-gray-900 mb-6">404</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Article not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/blog" className="btn-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  const formattedDate = new Date(post.created_at || post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const shareUrl = window.location.href;
  const shareText = `${post.title} — Navkar Engineering Blog`;

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  // Previous/Next posts
  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;

  const tags = post.tags ? post.tags.split(',').map(t => t.trim()) : [];

  return (
    <>
      <Helmet>
        <title>{post.title} — Navkar Engineering Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={`${post.title} — Navkar Engineering Blog`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
      </Helmet>

      <main>
        {/* ── Back link ── */}
        <div className="container-wide pt-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-accent transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Blog
          </Link>
        </div>

        <article>
          {/* ── Header ── */}
          <header className="container-wide pt-8 pb-10 md:pb-14">
            <div className="max-w-3xl mx-auto">
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${tag}`}
                      className="text-[11px] font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent dark:bg-accent/20 uppercase tracking-wider hover:bg-accent/20 dark:hover:bg-accent/30 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="heading-display text-display-sm md:text-display-md lg:text-display-lg text-gray-900 dark:text-white mb-5"
              >
                {post.title}
              </motion.h1>

              {/* Meta */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
                {post.readTime && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                )}
              </motion.div>
            </div>
          </header>

          {/* ── Cover Image ── */}
          {post.image || post.cover ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="container-wide mb-12"
            >
              <div className="max-w-4xl mx-auto">
                <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-soft">
                  <img
                    src={post.image || post.cover}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://placehold.co/1200x500/1e293b/64748b?text=${encodeURIComponent(post.title.substring(0, 40))}`;
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ) : null}

          {/* ── Article Content ── */}
          <div className="container-wide mb-16">
            <div className="max-w-3xl mx-auto">
              <div className="prose-custom">
                {renderMarkdown(post.content || '')}
              </div>

              {/* ── Share / Divider ── */}
              <div className="divider my-12" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share this article
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-accent hover:text-white dark:hover:bg-accent transition-all duration-200"
                    aria-label="Share on Twitter"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-accent hover:text-white dark:hover:bg-accent transition-all duration-200"
                    aria-label="Share on LinkedIn"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9.5h3.413v1.481h.049c.476-.9 1.637-1.852 3.371-1.852 3.604 0 4.271 2.372 4.271 5.455v6.86zM5.337 8.001c-1.145 0-2.07-.928-2.07-2.073 0-1.145.925-2.073 2.07-2.073 1.144 0 2.07.928 2.07 2.073 0 1.145-.926 2.073-2.07 2.073zM7.115 20.452H3.558V9.5h3.557v10.952z" />
                    </svg>
                  </a>
                  <button
                    onClick={handleShareLink}
                    className="relative w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-accent hover:text-white dark:hover:bg-accent transition-all duration-200"
                    aria-label="Copy link"
                  >
                    <Link2 className="w-4 h-4" />
                    {copied && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded whitespace-nowrap">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* ── Previous / Next Navigation ── */}
        <div className="container-wide mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="divider mb-8" />
            <div className="flex flex-col sm:flex-row gap-4">
              {nextPost ? (
                <Link
                  to={`/blog/${nextPost.slug}`}
                  className="flex-1 group p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-accent/30 dark:hover:border-accent/30 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all duration-200"
                >
                  <span className="text-xs font-medium text-gray-400 flex items-center gap-1 mb-2">
                    <ArrowLeft className="w-3 h-3" /> Previous article
                  </span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-accent transition-colors line-clamp-2">
                    {nextPost.title}
                  </span>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              {prevPost ? (
                <Link
                  to={`/blog/${prevPost.slug}`}
                  className="flex-1 group p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-accent/30 dark:hover:border-accent/30 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all duration-200 text-right"
                >
                  <span className="text-xs font-medium text-gray-400 flex items-center gap-1 justify-end mb-2">
                    Next article <ArrowRight className="w-3 h-3" />
                  </span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-accent transition-colors line-clamp-2">
                    {prevPost.title}
                  </span>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </div>
        </div>

        {/* ── Related Posts ── */}
        {relatedPosts.length > 0 && (
          <section className="section-padding bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-800/60">
            <div className="container-wide">
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full bg-accent/10 text-accent dark:bg-accent/20 border border-accent/10 mb-4">
                  <BookOpen className="w-3.5 h-3.5" />
                  You May Also Like
                </span>
                <h2 className="heading-display text-display-md text-gray-900 dark:text-white">Related Articles</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {relatedPosts.map((post, index) => (
                  <BlogCard key={post.id || post.slug} post={post} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="section-padding">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-accent/5 to-blue-500/5 dark:from-accent/10 dark:to-blue-500/5 rounded-3xl p-10 md:p-16 border border-accent/10">
              <h2 className="heading-display text-display-sm md:text-display-md text-gray-900 dark:text-white mb-4">
                Have a Question?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                Our team of experts is ready to help you with your fluid power, compressed air, or automation needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/contact" className="btn-primary">
                  Contact Us <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/products" className="btn-secondary">
                  Explore Products
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}