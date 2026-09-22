import { useEffect, useState } from 'react';
import { Search, X, Mail, Phone, Calendar, Trash2, Check, FileText, ExternalLink } from 'lucide-react';
import api from './AdminAPI';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadApplications(); }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getApplications();
      setApplications(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadApplications(); }, [filter]);

  const filtered = applications.filter(a => {
    // Client-side status filtering based on filter state
    const matchesStatus = 
      filter === 'all' || 
      (filter === 'unread' && !a.is_read) || 
      (filter === 'read' && a.is_read);

    const matchesSearch = 
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.message?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job application?')) return;
    try {
      await api.deleteApplication(id);
      setSelected(null);
      loadApplications();
    } catch (err) { alert(err.message); }
  };

  const handleMarkRead = async (id, isRead) => {
    try {
      await api.markApplicationRead(id, isRead ? 1 : 0);
      // Update selected reference if it's the one modified
      if (selected && selected.id === id) {
        setSelected(prev => ({ ...prev, is_read: isRead ? 1 : 0 }));
      }
      loadApplications();
    } catch (err) { alert(err.message); }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getResumeUrl = (url) => {
    if (!url) return '#';
    const API_BASE = import.meta.env.VITE_API_URL || '';
    return `${API_BASE}${url}`;
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
          <p className="text-gray-500 mt-1">{applications.filter(a => !a.is_read).length} unread applications</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search applications..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
        </div>
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-accent text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* List */}
        <div className="space-y-2 lg:max-h-[70vh] lg:overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400">No applications found</div>
          ) : filtered.map(app => (
            <div
              key={app.id}
              onClick={() => setSelected(app)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${selected?.id === app.id ? 'ring-2 ring-accent border-accent' : 'border-gray-200'} ${!app.is_read ? 'border-l-4 border-l-accent' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm ${!app.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{app.name}</h3>
                    {!app.is_read && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0"></span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {app.email}
                  </p>
                  {app.phone && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {app.phone}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400">{formatDate(app.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Details Panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
          {selected ? (
            <div>
              <div className="flex items-start justify-between gap-4 border-b pb-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                  <div className="flex flex-col gap-1 mt-2">
                    <a href={`mailto:${selected.email}`} className="text-sm text-gray-600 hover:text-accent flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" /> {selected.email}
                    </a>
                    {selected.phone && (
                      <a href={`tel:${selected.phone}`} className="text-sm text-gray-600 hover:text-accent flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" /> {selected.phone}
                      </a>
                    )}
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" /> Received: {formatDate(selected.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkRead(selected.id, !selected.is_read)}
                    title={selected.is_read ? "Mark as unread" : "Mark as read"}
                    className={`p-2 rounded-lg border transition-colors ${selected.is_read ? 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    title="Delete Application"
                    className="p-2 rounded-lg border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selected.resume_url && (
                <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-150 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Attached Candidate CV</p>
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                        {selected.resume_url.split('/').pop()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={getResumeUrl(selected.resume_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    View Resume
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cover Letter / Cover Message</h4>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100 min-h-[120px] whitespace-pre-wrap">
                    {selected.message || 'No message provided.'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-gray-400">
              Select an application from the list to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
