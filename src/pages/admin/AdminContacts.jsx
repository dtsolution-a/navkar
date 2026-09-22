import { useEffect, useState } from 'react';
import { Search, X, Mail, Phone, Building, Calendar, Trash2, Check, Eye, EyeOff, ExternalLink, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from './AdminAPI';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selected, setSelected] = useState(null);

  const handleExportExcel = () => {
    try {
      const formatted = contacts.map((c, i) => ({
        'S.No.': i + 1,
        'Name': c.name,
        'Email': c.email,
        'Phone': c.phone || 'N/A',
        'Company': c.company || 'N/A',
        'Subject': c.subject || 'N/A',
        'Message': c.message || 'N/A',
        'Read Status': c.is_read ? 'Read' : 'Unread',
        'Date': new Date(c.created_at).toLocaleString('en-IN'),
      }));

      const worksheet = XLSX.utils.json_to_sheet(formatted);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiries');
      
      // Auto-fit column widths
      const maxLens = {};
      formatted.forEach(row => {
        Object.keys(row).forEach(key => {
          const val = String(row[key]);
          maxLens[key] = Math.max(maxLens[key] || 10, val.length);
        });
      });
      worksheet['!cols'] = Object.keys(maxLens).map(key => ({ wch: Math.min(50, maxLens[key] + 3) }));

      XLSX.writeFile(workbook, `Navkar_Enquiries_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      alert('Failed to export enquiries to Excel: ' + err.message);
    }
  };

  useEffect(() => { loadContacts(); }, []);

  const loadContacts = async () => {
    try {
      let data;
      if (filter === 'unread') {
        data = await api.getContacts(0);
      } else if (filter === 'read') {
        data = await api.getContacts(1);
      } else {
        data = await api.getContacts();
      }
      setContacts(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadContacts(); }, [filter]);

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      await api.deleteContact(id);
      setSelected(null);
      loadContacts();
    } catch (err) { alert(err.message); }
  };

  const handleMarkRead = async (id, isRead) => {
    try {
      await api.markContactRead(id, isRead);
      loadContacts();
    } catch (err) { alert(err.message); }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
          <p className="text-gray-500 mt-1">{contacts.filter(c => !c.is_read).length} unread</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Export to Excel
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search enquiries..." value={search} onChange={e => setSearch(e.target.value)}
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
            <div className="py-12 text-center text-gray-400">No enquiries found</div>
          ) : filtered.map(contact => (
            <div
              key={contact.id}
              onClick={() => setSelected(contact)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${selected?.id === contact.id ? 'ring-2 ring-accent border-accent' : 'border-gray-200'} ${!contact.is_read ? 'border-l-4 border-l-accent' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm ${!contact.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{contact.name}</h3>
                    {!contact.is_read && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0"></span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{contact.email}</p>
                  {contact.subject && <p className="text-sm text-gray-600 mt-1 line-clamp-1">{contact.subject}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={e => { e.stopPropagation(); handleMarkRead(contact.id, !contact.is_read); }}
                    className={`p-1.5 rounded-lg transition-colors ${contact.is_read ? 'text-gray-300 hover:text-gray-500' : 'text-accent hover:bg-accent/10'}`}>
                    {contact.is_read ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(contact.id); }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{formatDate(contact.created_at)}</p>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:sticky lg:top-24">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
                  <p className="text-sm text-gray-500">{formatDate(selected.created_at)}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${selected.is_read ? 'bg-gray-100 text-gray-600' : 'bg-accent/10 text-accent'}`}>
                  {selected.is_read ? 'Read' : 'New'}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${selected.email}`} className="hover:text-accent">{selected.email}</a>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${selected.phone}`} className="hover:text-accent">{selected.phone}</a>
                  </div>
                )}
                {selected.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span>{selected.company}</span>
                  </div>
                )}
              </div>

              {selected.subject && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-sm font-medium text-gray-900">{selected.subject}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Message</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">{selected.message}</p>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                  <Mail className="w-4 h-4" /> Reply via Email
                </a>
                <button onClick={() => handleMarkRead(selected.id, selected.is_read ? 0 : 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selected.is_read ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-accent text-accent hover:bg-accent/5'}`}>
                  {selected.is_read ? 'Mark as Unread' : 'Mark as Read'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select an enquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}