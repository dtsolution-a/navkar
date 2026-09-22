import { useState, useEffect, useCallback, useRef } from 'react';

// In production: VITE_API_URL = https://shah-api.up.railway.app
// In development: empty string -> Vite proxy handles /api -> localhost:3001
const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api/public`;
const FETCH_TIMEOUT = 8000; // 8s timeout (Railway cold start can be slow)

// Cache buster to avoid browser caching
function bustCache(url) {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_t=${Date.now()}`;
}

// Fetch with timeout so we don't hang when backend is down
function fetchWithTimeout(url, ms = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timeout));
}

// Shared store for reactive updates across components
const listeners = new Set();
let cached = {
  brands: [],
  categories: [],
  blogPosts: [],
};

function notifyListeners() {
  listeners.forEach(fn => fn());
}

// Call this after any admin operation to trigger refresh
export function refreshSiteData() {
  notifyListeners();
}

// Generic fetch with caching
function useReactiveFetch(url, transformer = (d) => d) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  // Subscribe to refresh notifications
  useEffect(() => {
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  // Fetch data
  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(url))
      .then(r => { if (!r.ok) throw new Error('Fetch failed'); return r.json(); })
      .then(d => { if (mountedRef.current) setData(transformer(d)); })
      .catch(() => {
        // Fallback to static data
        // Fallback handled by the catch in the calling hook
      })
      .finally(() => { if (mountedRef.current) setLoading(false); });
  }, [url, version]);

  return { data, loading };
}

// Fetch all brands with counts
export function useBrands() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(`${API}/brands`))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => {
        if (mountedRef.current) {
          if (d && d.length > 0) {
            const sorted = [...d].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name));
            setData(sorted);
          } else {
            // Fallback to static data if API returns empty
            import('../data/products.js').then(m => {
              if (mountedRef.current) {
                const brandsWithCounts = m.brands.map(b => {
                  const brandCats = m.categories.filter(c => c.brandId === b.id);
                  const pCount = brandCats.reduce((sum, c) => sum + (c.products ? c.products.length : 0), 0);
                  return { ...b, productCount: pCount };
                });
                const sorted = brandsWithCounts;
                setData(sorted);
              }
            });
          }
          setLoading(false);
        }
      })
      .catch(() => {
        import('../data/products.js').then(m => {
          if (mountedRef.current) {
            const brandsWithCounts = m.brands.map(b => {
              const brandCats = m.categories.filter(c => c.brandId === b.id);
              const pCount = brandCats.reduce((sum, c) => sum + (c.products ? c.products.length : 0), 0);
              return { ...b, productCount: pCount };
            });
            const sorted = brandsWithCounts;
            setData(sorted);
            setLoading(false);
          }
        });
      });
  }, [version]);

  return { brands: data, loading };
}

// Fetch categories with products
export function useCategories(brandId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = brandId ? `${API}/categories?brandId=${brandId}` : `${API}/categories`;
    fetchWithTimeout(bustCache(url))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => {
        if (mountedRef.current) {
          if (d && d.length > 0) {
            setData(d);
          } else {
            // Fallback to static data if API returns empty
            import('../data/products.js').then(m => {
              if (mountedRef.current) {
                let cats = m.categories;
                if (brandId) cats = cats.filter(c => c.brandId === brandId);
                setData(cats);
              }
            });
          }
          setLoading(false);
        }
      })
      .catch(() => {
        import('../data/products.js').then(m => {
          if (mountedRef.current) {
            let cats = m.categories;
            if (brandId) cats = cats.filter(c => c.brandId === brandId);
            setData(cats);
            setLoading(false);
          }
        });
      });
  }, [brandId, version]);

  return { categories: data, loading };
}

// Fetch single category by brandId + slug
export function useCategory(brandId, slug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(`${API}/categories/${brandId}/${slug}`))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => { if (mountedRef.current) { setData(d); setLoading(false); } })
      .catch(() => {
        import('../data/products.js').then(m => {
          if (mountedRef.current) {
            const cat = m.categories.find(c => c.brandId === brandId && c.slug === slug);
            setData(cat || null);
            setLoading(false);
          }
        });
      });
  }, [brandId, slug, version]);

  return { category: data, loading };
}

// Fetch single brand
export function useBrand(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(`${API}/brands/${id}`))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => { if (mountedRef.current) { setData(d); setLoading(false); } })
      .catch(() => {
        import('../data/products.js').then(m => {
          if (mountedRef.current) {
            setData(m.brands.find(b => b.id === id) || null);
            setLoading(false);
          }
        });
      });
  }, [id, version]);

  return { brand: data, loading };
}

// Fetch published blog posts
export function useBlogPosts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(`${API}/blog`))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => {
        if (mountedRef.current) {
          if (d && d.length > 0) {
            setData(d);
          } else {
            // Fallback to static data if API returns empty
            import('../data/blog.js').then(m => {
              if (mountedRef.current) {
                const allPosts = m.blogPosts || [];
                setData(allPosts.filter(p => p.is_published !== false));
              }
            });
          }
          setLoading(false);
        }
      })
      .catch(() => {
        import('../data/blog.js').then(m => {
          if (mountedRef.current) {
            const allPosts = m.blogPosts || [];
            setData(allPosts.filter(p => p.is_published !== false));
            setLoading(false);
          }
        });
      });
  }, [version]);

  return { posts: data, loading };
}

// Fetch single blog post by slug
export function useBlogPost(slug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(`${API}/blog/slug/${slug}`))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => {
        if (mountedRef.current) {
          if (d) {
            setData(d);
          } else {
            // Fallback to static data if API returns null/empty
            import('../data/blog.js').then(m => {
              if (mountedRef.current) {
                const posts = m.blogPosts || [];
                setData(posts.find(p => p.slug === slug) || null);
              }
            });
          }
          setLoading(false);
        }
      })
      .catch(() => {
        import('../data/blog.js').then(m => {
          if (mountedRef.current) {
            const posts = m.blogPosts || [];
            setData(posts.find(p => p.slug === slug) || null);
            setLoading(false);
          }
        });
      });
  }, [slug, version]);

  return { post: data, loading };
}
// Fetch testimonials by page (home or career)
export function useTestimonials(page = 'home') {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => { listeners.delete(handler); mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(`${API}/testimonials?page=${page}`))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => { if (mountedRef.current) { setData(d || []); setLoading(false); } })
      .catch(() => { if (mountedRef.current) { setData([]); setLoading(false); } });
  }, [page, version]);

  return { testimonials: data, loading };
}

// Fetch career jobs (public)
export function useJobs() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => { listeners.delete(handler); mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(`${API}/jobs`))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => { if (mountedRef.current) { setData(d || []); setLoading(false); } })
      .catch(() => { if (mountedRef.current) { setData([]); setLoading(false); } });
  }, [version]);

  return { jobs: data, loading };
}

// Fallback Solutions data
const fallbackSolutions = [
  {
    id: 'compressed-air',
    icon: 'Wind',
    name: 'Compressed Air Systems',
    description: 'Complete air generation, treatment & distribution from leading brands',
    brands: 'Parker, Kaishan, Chicago Pneumatic, Trident',
    href: '/products',
    image: '/images/categories/compressed-air.jpg',
    accent: '#2563EB',
    number: '01',
  },
  {
    id: 'pneumatics',
    icon: 'Settings2',
    name: 'Pneumatics & Automation',
    description: 'Cylinders, solenoid valves, fittings, tubing & FRL units for automation',
    brands: 'Parker',
    href: '/products/parker/pneumatics',
    image: '/images/categories/pneumatics.jpg',
    accent: '#6366f1',
    number: '02',
  },
  {
    id: 'instrumentation',
    icon: 'Gauge',
    name: 'Instrumentation',
    description: 'High-pressure fittings, needle valves, manifolds & process components',
    brands: 'Parker',
    href: '/products/parker/instrumentation',
    image: '/images/categories/instrumentation.jpg',
    accent: '#8b5cf6',
    number: '03',
  },
  {
    id: 'hydraulics',
    icon: 'Cable',
    name: 'Hydraulics',
    description: 'Hoses, fittings, adapters, filters & condition monitoring equipment',
    brands: 'Parker',
    href: '/products/parker/hydraulic-connectors',
    image: '/images/categories/hydraulics.jpg',
    accent: '#0891b2',
    number: '04',
  },
  {
    id: 'gas-gen',
    icon: 'Zap',
    name: 'Gas Generation',
    description: 'On-site nitrogen, hydrogen & zero-air generators for labs & industry',
    brands: 'Parker',
    href: '/products/parker/gas-generator',
    image: '/images/categories/gas-generation.jpg',
    accent: '#d97706',
    number: '05',
  },
  {
    id: 'clean-energy',
    icon: 'Leaf',
    name: 'Clean Energy — CNG & H₂',
    description: 'Fueling infrastructure for CNG and hydrogen stations across India',
    brands: 'Parker',
    href: '/products/parker/clean-energy',
    image: '/images/categories/clean-energy.jpg',
    accent: '#16a34a',
    number: '06',
  },
];

// Fallback Gallery data
const fallbackGallery = [
  { id: 'o1', url: '/images/gallery/office/office-1.jpg', title: 'Navkar Engineering Office' },
  { id: 'o2', url: '/images/gallery/office/office-2.jpg', title: 'Office workspace' },
  { id: 'o3', url: '/images/gallery/office/office-3.jpg', title: 'Reception area' },
  { id: 'o4', url: '/images/gallery/office/office-4.jpg', title: 'Conference room' },
  { id: 'm1', url: '/images/gallery/machinery/machinery-1.jpg', title: 'Industrial machinery' },
  { id: 'm2', url: '/images/gallery/machinery/machinery-2.jpg', title: 'Equipment display' },
  { id: 'm3', url: '/images/gallery/machinery/machinery-3.jpg', title: 'Compressor systems' },
  { id: 'm4', url: '/images/gallery/machinery/machinery-4.jpg', title: 'Hydraulic systems' },
  { id: 's1', url: '/images/gallery/store/store-1.jpg', title: 'Product store' },
  { id: 's2', url: '/images/gallery/store/store-2.jpg', title: 'Spare parts inventory' },
  { id: 'w1', url: '/images/gallery/workshop/workshop-1.jpg', title: 'Workshop floor' },
  { id: 't1', url: '/images/gallery/team/team-1.jpg', title: 'Navkar Engineering team' },
  { id: 't5', url: '/images/gallery/team/team-5.jpg', title: 'Kaushik Navkar — Founder and Managing Director' },
];

// Fallback Hero Slides
const fallbackHeroSlides = [
  {
    id: 1,
    image: '/images/hero/slide-1.jpg',
    tag: 'Parker Hannifin · Authorized Distributor',
    headline: "India's Trusted Partner for Industrial Fluid Power",
    sub: 'Pneumatics · Hydraulics · Instrumentation · Compressed Air Systems',
    accent: 'from-blue-600/20 to-indigo-900/60',
  },
  {
    id: 2,
    image: '/images/hero/slide-2.jpg',
    tag: 'Kaishan & Chicago Pneumatic · Distributor',
    headline: 'World-Class Air Compressor Solutions for Every Industry',
    sub: 'Oil-Free · Rotary Screw · Reciprocating · Energy-Efficient Systems',
    accent: 'from-sky-700/20 to-blue-950/60',
  },
  {
    id: 3,
    image: '/images/hero/slide-3.jpg',
    tag: 'Tubacex & Trident · Authorized Representative',
    headline: '30+ Years of Technical Excellence in Surat, Gujarat',
    sub: 'SS Tubes · Air Purification · Gas Generation · Clean Energy',
    accent: 'from-indigo-700/20 to-slate-950/60',
  },
  {
    id: 4,
    image: '/images/hero/slide-4.jpg',
    tag: 'Parker Clean Energy · CNG & Hydrogen',
    headline: "Powering India's Clean Energy Future",
    sub: 'CNG Dispensers · Hydrogen Fueling Infrastructure · Zero-Emission',
    accent: 'from-teal-700/20 to-blue-950/60',
  },
];

// Hook to fetch active industrial solutions
export function useSolutions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => { listeners.delete(handler); mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(`${API}/solutions`))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => {
        if (mountedRef.current) {
          if (d && d.length > 0) {
            setData(d);
          } else {
            setData(fallbackSolutions);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setData(fallbackSolutions);
          setLoading(false);
        }
      });
  }, [version]);

  return { data, solutions: data, loading };
}

// Hook to fetch active gallery photos
export function useGalleryPhotos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => { listeners.delete(handler); mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(`${API}/gallery`))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => {
        if (mountedRef.current) {
          if (d && d.length > 0) {
            setData(d);
          } else {
            setData(fallbackGallery);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setData(fallbackGallery);
          setLoading(false);
        }
      });
  }, [version]);

  return { data, photos: data, loading };
}

// Hook to fetch active hero slides
export function useHeroSlides() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => { listeners.delete(handler); mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(`${API}/hero-slides`))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => {
        if (mountedRef.current) {
          if (d && d.length > 0) {
            setData(d);
          } else {
            setData(fallbackHeroSlides);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setData(fallbackHeroSlides);
          setLoading(false);
        }
      });
  }, [version]);

  return { data, slides: data, loading };
}

// Hook to fetch active timeline events (public)
export function useTimeline() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => { listeners.delete(handler); mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(`${API}/timeline`))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => {
        if (mountedRef.current) {
          setData(d || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          // Fallback to static timeline from About.jsx if API fails
          setData([
            { year: '1995', event: 'Navkar Enterprise established in Surat, Gujarat' },
            { year: '2000', event: 'Became authorized Parker Hannifin distributor for Gujarat region' },
            { year: '2008', event: 'Expanded product portfolio with hydraulics and instrumentation' },
            { year: '2015', event: 'Added Kaishan air compressors to the portfolio' },
            { year: '2020', event: 'Entered clean energy segment — CNG & Hydrogen fueling solutions' },
            { year: '2025', event: 'Serving 5800+ clients across India with 500+ product lines' },
          ]);
          setLoading(false);
        }
      });
  }, [version]);

  return { timeline: data, loading };
}

// Hook to fetch public settings (e.g. indiamart_link)
export function usePublicSettings() {
  const [data, setData] = useState({ indiamart_link: '' });
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handler = () => setVersion(v => v + 1);
    listeners.add(handler);
    return () => { listeners.delete(handler); mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWithTimeout(bustCache(`${API}/settings`))
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(d => {
        if (mountedRef.current) {
          setData(d || { indiamart_link: '' });
          setLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setData({ indiamart_link: '' });
          setLoading(false);
        }
      });
  }, [version]);

  return { settings: data, loading };
}

