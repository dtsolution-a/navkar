import { useEffect, useState } from 'react';
import { Package, Tag, ShoppingBag, FileText, MessageSquare, TrendingUp, AlertCircle, Star, Briefcase, Sliders, Layers, Image, UserCheck, Calendar, Settings } from 'lucide-react';
import api from './AdminAPI';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    brands: 0, categories: 0, products: 0, blogPosts: 0, unreadContacts: 0, testimonials: 0, jobs: 0,
    heroSlides: 0, solutions: 0, galleryPhotos: 0, unreadApplications: 0, timelineEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [brands, categories, products, blog, contacts, testimonials, jobs, solutions, gallery, slides, applications, timeline] = await Promise.all([
        api.getBrands(),
        api.getCategories(),
        api.getProducts(),
        api.getBlogPosts(),
        api.getContacts(0), // unread only
        api.request('GET', '/testimonials').catch(() => []),
        api.request('GET', '/jobs').catch(() => []),
        api.request('GET', '/solutions').catch(() => []),
        api.request('GET', '/gallery').catch(() => []),
        api.request('GET', '/hero-slides').catch(() => []),
        api.request('GET', '/applications').catch(() => []),
        api.getTimelineEvents().catch(() => []),
      ]);
      setStats({
        brands: brands.length,
        categories: categories.length,
        products: products.length,
        blogPosts: blog.length,
        unreadContacts: contacts.length,
        testimonials: Array.isArray(testimonials) ? testimonials.length : (testimonials.testimonials || []).length,
        jobs: Array.isArray(jobs) ? jobs.length : (jobs.jobs || []).length,
        solutions: Array.isArray(solutions) ? solutions.length : 0,
        galleryPhotos: Array.isArray(gallery) ? gallery.length : 0,
        heroSlides: Array.isArray(slides) ? slides.length : 0,
        unreadApplications: Array.isArray(applications) ? applications.filter(a => !a.is_read).length : 0,
        timelineEvents: Array.isArray(timeline) ? timeline.length : 0,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Hero Slides', value: stats.heroSlides, icon: Sliders, color: 'bg-indigo-500', href: '/ad-admin/hero-slides' },
    { label: 'Brands', value: stats.brands, icon: Package, color: 'bg-blue-500', href: '/ad-admin/brands' },
    { label: 'Categories', value: stats.categories, icon: Tag, color: 'bg-purple-500', href: '/ad-admin/categories' },
    { label: 'Products', value: stats.products, icon: ShoppingBag, color: 'bg-green-500', href: '/ad-admin/products' },
    { label: 'Solutions', value: stats.solutions, icon: Layers, color: 'bg-pink-500', href: '/ad-admin/solutions' },
    { label: 'Gallery Photos', value: stats.galleryPhotos, icon: Image, color: 'bg-cyan-500', href: '/ad-admin/gallery' },
    { label: 'Blog Posts', value: stats.blogPosts, icon: FileText, color: 'bg-orange-500', href: '/ad-admin/blog' },
    { label: 'Timeline Milestones', value: stats.timelineEvents, icon: Calendar, color: 'bg-indigo-600', href: '/ad-admin/timeline' },
    { label: 'Unread Enquiries', value: stats.unreadContacts, icon: MessageSquare, color: 'bg-red-500', href: '/ad-admin/contacts' },
    { label: 'Testimonials', value: stats.testimonials, icon: Star, color: 'bg-yellow-500', href: '/ad-admin/testimonials' },
    { label: 'Jobs', value: stats.jobs, icon: Briefcase, color: 'bg-teal-500', href: '/ad-admin/jobs' },
    { label: 'Unread Applications', value: stats.unreadApplications, icon: UserCheck, color: 'bg-emerald-500', href: '/ad-admin/applications' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your website content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <a
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 rounded-lg ${card.color} bg-opacity-10 flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color.replace('bg-', 'text-')}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </a>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <a href="/ad-admin/hero-slides" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700">Manage Hero Slides</span>
          </a>
          <a href="/ad-admin/brands" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <Package className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Add New Brand</span>
          </a>
          <a href="/ad-admin/categories" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <Tag className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Add New Category</span>
          </a>
          <a href="/ad-admin/products" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <ShoppingBag className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Add New Product</span>
          </a>
          <a href="/ad-admin/solutions" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <Layers className="w-5 h-5 text-pink-500" />
            <span className="text-sm font-medium text-gray-700">Manage Solutions</span>
          </a>
          <a href="/ad-admin/gallery" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <Image className="w-5 h-5 text-cyan-500" />
            <span className="text-sm font-medium text-gray-700">Manage Gallery</span>
          </a>
          <a href="/ad-admin/blog" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <FileText className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Write Blog Post</span>
          </a>
          <a href="/ad-admin/contacts" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <MessageSquare className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-700">View Enquiries</span>
          </a>
          <a href="/ad-admin/testimonials" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Manage Testimonials</span>
          </a>
          <a href="/ad-admin/jobs" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <Briefcase className="w-5 h-5 text-teal-500" />
            <span className="text-sm font-medium text-gray-700">Manage Jobs</span>
          </a>
          <a href="/ad-admin/applications" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-gray-700">View Applications</span>
          </a>
          <a href="/ad-admin/timeline" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Manage Timeline</span>
          </a>
          <a href="/ad-admin/settings" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">General Settings</span>
          </a>
          <a href="/" target="_blank" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-accent hover:bg-accent/5 transition-colors">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">View Live Website</span>
          </a>
        </div>
      </div>

      {/* Info Banners */}
      {(stats.unreadContacts > 0 || stats.unreadApplications > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {stats.unreadContacts > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  You have {stats.unreadContacts} unread enquiry{stats.unreadContacts > 1 ? 'ies' : 'y'}
                </p>
                <a href="/ad-admin/contacts" className="text-sm text-amber-600 hover:underline mt-1 inline-block">
                  View enquiries →
                </a>
              </div>
            </div>
          )}
          {stats.unreadContacts > 0 && stats.unreadApplications > 0 && <div className="hidden" />}
          {stats.unreadApplications > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-800">
                  You have {stats.unreadApplications} unread job application{stats.unreadApplications > 1 ? 's' : ''}
                </p>
                <a href="/ad-admin/applications" className="text-sm text-emerald-600 hover:underline mt-1 inline-block">
                  View applications →
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}