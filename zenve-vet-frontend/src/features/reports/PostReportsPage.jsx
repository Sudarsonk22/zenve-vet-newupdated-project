import { useEffect, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Clock, Flag, RotateCcw } from 'lucide-react';
import { mediaSrc } from '../../network-ui/api';
import './reports.css';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recently';
  }
}

function isVideo(url) {
  return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(url);
}

function PostMedia({ url }) {
  const style = { width: '100%', maxHeight: 340, objectFit: 'contain', borderRadius: 10, background: '#0f172a' };
  if (isVideo(url)) {
    return <video src={mediaSrc(url)} controls style={style} />;
  }
  return <img src={mediaSrc(url)} alt="Flagged post" style={style} />;
}

export default function PostReportsPage() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE}/reports?page=0&size=100`);
      if (!res.ok) throw new Error('Could not load reports');
      const data = await res.json();
      setReports(data.items || data.content || []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async id => {
    try {
      const res = await fetch(`${BASE}/reports/${id}/resolve`, { method: 'PUT' });
      if (!res.ok) throw new Error('Could not resolve the report');
      setReports(reports.map(r => (r.id === id ? { ...r, resolved: true } : r)));
      setToast(`Report #${id} marked as resolved.`);
      setTimeout(() => setToast(''), 3000);
    } catch (e) {
      setError(e.message);
    }
  };

  const pending = reports.filter(r => !r.resolved).length;
  const resolved = reports.length - pending;

  const shown = reports.filter(r => {
    if (filter === 'PENDING') return !r.resolved;
    if (filter === 'RESOLVED') return r.resolved;
    return true;
  });

  return (
    <main className="main-content">
      <div className="reports-page">
        <header className="reports-header">
          <div>
            <span className="comm-eyebrow">MODERATION &amp; SAFETY</span>
            <h1>Content &amp; Post Reports</h1>
            <p>Review posts flagged by doctors for spam, misinformation and safety concerns.</p>
          </div>
          <button type="button" className="comm-btn-secondary" onClick={load}>
            <RotateCcw size={15} /> Refresh
          </button>
        </header>

        <div className="reports-kpis">
          <div className="report-kpi-card">
            <div>
              <small>Total Flagged</small>
              <b>{reports.length}</b>
            </div>
            <Flag size={24} color="#64748b" />
          </div>
          <div className="report-kpi-card">
            <div>
              <small>Pending</small>
              <b style={{ color: '#b45309' }}>{pending}</b>
            </div>
            <Clock size={24} color="#f59e0b" />
          </div>
          <div className="report-kpi-card">
            <div>
              <small>Resolved</small>
              <b style={{ color: '#15803d' }}>{resolved}</b>
            </div>
            <CheckCircle2 size={24} color="#22c55e" />
          </div>
        </div>

        <div className="reports-filter-bar">
          <button type="button" className={filter === 'ALL' ? 'reports-filter-btn active' : 'reports-filter-btn'} onClick={() => setFilter('ALL')}>
            All Reports ({reports.length})
          </button>
          <button type="button" className={filter === 'PENDING' ? 'reports-filter-btn active' : 'reports-filter-btn'} onClick={() => setFilter('PENDING')}>
            <Clock size={13} /> Pending ({pending})
          </button>
          <button type="button" className={filter === 'RESOLVED' ? 'reports-filter-btn active' : 'reports-filter-btn'} onClick={() => setFilter('RESOLVED')}>
            <CheckCircle2 size={13} /> Resolved ({resolved})
          </button>
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>Loading reports...</div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <CheckCircle2 size={40} color="#22c55e" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: '#1e293b' }}>No Reports in this View</h3>
            <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
              Posts that doctors flag will show up here.
            </p>
          </div>
        ) : (
          <div className="reports-list">
            {shown.map(r => (
              <div key={r.id} className="report-card">
                <div className="report-card-top">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span className="report-reason-pill">
                        <AlertTriangle size={12} /> {r.reason}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>Report #{r.id}</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#64748b' }}>
                      Flagged by <b>{r.reporter ? r.reporter.fullName : 'a doctor'}</b>
                      {r.reporter && r.reporter.specialty ? ` (${r.reporter.specialty})` : ''}
                    </span>
                  </div>

                  <span className={r.resolved ? 'report-status-badge resolved' : 'report-status-badge pending'}>
                    {r.resolved ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {r.resolved ? 'Resolved' : 'Pending'}
                  </span>
                </div>

                <blockquote className="report-post-quote">"{r.postBody || 'Post content not available'}"</blockquote>

                {r.postMediaUrl && <PostMedia url={r.postMediaUrl} />}

                {r.details && (
                  <div style={{ fontSize: 13, color: '#334155' }}>
                    <strong style={{ color: '#475569' }}>Reporter Notes:</strong> {r.details}
                  </div>
                )}

                <div className="report-meta-row">
                  <span>Date: {formatDate(r.createdAt)}</span>
                  <span>Post ID: #{r.postId}</span>
                </div>

                {!r.resolved && (
                  <div className="report-actions">
                    <button type="button" className="report-btn-action resolve" onClick={() => resolve(r.id)}>
                      <Check size={14} /> Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {toast && (
          <div className="toast">
            <CheckCircle2 size={18} />
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}