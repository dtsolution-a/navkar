import { useEffect, useState } from 'react';
import { Save, AlertCircle, Check } from 'lucide-react';
import api from './AdminAPI';
import { refreshSiteData } from '../../hooks/useSiteData';

export default function AdminSettings() {
  const [settings, setSettings] = useState({ indiamart_link: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(prev => ({
        ...prev,
        ...data
      }));
    } catch (err) {
      console.error(err);
      setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      await api.updateSettings(settings);
      setSuccess(true);
      refreshSiteData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
        <p className="text-gray-500 mt-1">Configure global parameters and integrations for the website</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* IndiaMart Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">IndiaMart Profile Link</label>
            <input
              type="url"
              value={settings.indiamart_link || ''}
              onChange={e => setSettings({...settings, indiamart_link: e.target.value})}
              placeholder="e.g. https://www.indiamart.com/shah-engineers-consultants/"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-2">
              Provide the direct URL to your company's IndiaMart profile. If this link is left blank, 
              the "IndiaMart" button will be completely hidden from the website navigation header.
            </p>
          </div>

          <div className="pt-6 border-t border-gray-150">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Form Email Routing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Instrumentation Inquiry Email</label>
                <input
                  type="email"
                  value={settings.email_instrumentation || ''}
                  onChange={e => setSettings({...settings, email_instrumentation: e.target.value})}
                  placeholder="support.inst@navkarengineering.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Compressor Inquiry Email</label>
                <input
                  type="email"
                  value={settings.email_compressor || ''}
                  onChange={e => setSettings({...settings, email_compressor: e.target.value})}
                  placeholder="support.compressor@navkarengineering.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">General / Others Inquiry Email</label>
                <input
                  type="email"
                  value={settings.email_others || ''}
                  onChange={e => setSettings({...settings, email_others: e.target.value})}
                  placeholder="info@navkarengineering.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-4 flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-4 flex items-center gap-2.5">
              <Check className="w-5 h-5 flex-shrink-0 bg-green-500 text-white rounded-full p-0.5" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <div className="pt-4 border-t border-gray-150 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
