import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Analyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      .btn-primary {
        background: #000; color: #fff; border: none;
        padding: 13px 28px; border-radius: 6px;
        font-size: 14px; font-weight: 500; cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        transition: opacity 0.15s, transform 0.1s;
      }
      .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
      .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      .action-item {
        display: flex; align-items: flex-start; gap: 12px;
        padding: 14px 0; border-bottom: 1px solid #f0f0f0;
      }
      .action-item:last-child { border-bottom: none; }
      .priority-badge {
        font-size: 11px; font-weight: 600; padding: 4px 10px;
        border-radius: 4px; text-transform: uppercase;
        flex-shrink: 0;
      }
      .priority-high { background: #fee2e2; color: #dc2626; }
      .priority-medium { background: #fef3c7; color: #d97706; }
      .priority-low { background: #dcfce7; color: #16a34a; }
      @media (max-width: 768px) {
        .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .results-grid { grid-template-columns: 1fr !important; }
        .header-row { flex-direction: column; gap: 16px; align-items: stretch; }
        .header-row > div:first-child { text-align: center; }
        .upload-btn { width: 100%; justify-content: center; }
        .file-bar { flex-direction: column; gap: 12px; }
        .file-bar > div:nth-child(3) { justify-content: center; }
        .action-item { flex-direction: column; gap: 8px; }
        .action-item .priority-badge { align-self: flex-start; }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setError(null);
    setResponse(null);
    
    if (file && file.size > 50 * 1024 * 1024) {
      setError('File is too large. Maximum size is 50MB');
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    try {
      const res = await fetch(`${API_URL}/api/upload-audio`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success === true && data.data) {
        setResponse(data.data);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setResponse(null);
    setSelectedFile(null);
    setError(null);
  };

  const priorityCount = response?.tasks?.reduce((acc, item) => {
    const p = item.priority?.toLowerCase() || 'medium';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {}) || { high: 0, medium: 0, low: 0 };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const getTranscriptWordCount = () => {
    return response?.raw_transcript?.split(/\s+/).filter(Boolean).length || 0;
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', color: '#000', minHeight: '100vh' }}>
      {/* Topbar */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #e8e8e8',
        padding: '0 24px', height: '56px',
        display: 'flex', alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '26px', height: '26px', background: '#000', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>Meeting Analyzer</span>
        </Link>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div className="header-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#000', marginBottom: '4px' }}>
              {response ? 'Analysis Results' : 'Dashboard'}
            </h1>
            <p style={{ fontSize: '13px', color: '#888' }}>
              {response ? `${selectedFile?.name || 'audio'} - analyzed just now` : 'Upload an audio file to analyze'}
            </p>
          </div>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#EB0029', color: '#fff',
            borderRadius: '6px', padding: '10px 16px',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            transition: 'opacity 0.2s'
          }} className="upload-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload audio
            <input type="file" accept="audio/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Stats Row */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Action items</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#000' }}>{response?.tasks?.length || 0}</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>from this meeting</div>
          </div>
          <div style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Language</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#000' }}>{response?.language === 'en' ? 'English' : (response?.language || 'Auto')}</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>auto-detected</div>
          </div>
          <div style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Duration</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#000' }}>{response?.duration || '--'}</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{getTranscriptWordCount()} words</div>
          </div>
          <div style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Priority</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: priorityCount.high > 0 ? '#dc2626' : '#000' }}>
              {priorityCount.high > 0 ? `${priorityCount.high} urgent` : 'No urgent'}
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{priorityCount.medium + priorityCount.low} others</div>
          </div>
        </div>

        {/* File Bar */}
        {selectedFile && (
          <div className="file-bar" style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', transition: 'all 0.2s ease' }}>
            <div style={{ width: '44px', height: '44px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"/>
                <path d="M9 2v4h4"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#000' }}>{selectedFile.name}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{formatFileSize(selectedFile.size)} - uploaded just now</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isLoading ? (
                <span style={{ fontSize: '13px', color: '#999' }}>Processing...</span>
              ) : response ? (
                <>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                  <span style={{ fontSize: '13px', color: '#999' }}>processed</span>
                </>
              ) : null}
              {(response || selectedFile) && (
                <button onClick={handleClear} style={{ 
                  fontSize: '12px', color: '#666', background: 'none', border: '1px solid #ddd', 
                  padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s'
                }}>
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: '14px', color: '#dc2626' }}>{error}</span>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        {!response && selectedFile && !isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <button className="btn-primary" onClick={handleUpload}>
              Analyze Audio
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #f0f0f0', borderTop: '3px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ fontSize: '14px', color: '#999', marginTop: '16px' }}>Processing... (first request may take up to 60 seconds)</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Results */}
        {response && !isLoading && (
          <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Action Items */}
              <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>Action items</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {response.tasks?.map((item, index) => (
                    <div key={index} className="action-item">
                      <span style={{ fontSize: '12px', color: '#ccc', fontFamily: 'monospace', minWidth: '28px' }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                          {item.assigned_to !== 'Unassigned' && <span style={{ fontWeight: '600' }}>{item.assigned_to} — </span>}
                          {item.task}
                          {item.deadline && item.deadline !== 'Not specified' && <span style={{ color: '#999' }}> — {item.deadline}</span>}
                        </p>
                      </div>
                      <span className={`priority-badge priority-${item.priority?.toLowerCase()}`}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                  {(!response.tasks || response.tasks.length === 0) && (
                    <p style={{ fontSize: '14px', color: '#999' }}>No action items detected</p>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Summary</h2>
                <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.7' }}>
                  {response.summary || response.raw_transcript?.slice(0, 300) || 'No summary available'}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Priority Breakdown */}
              <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>Priority breakdown</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {['high', 'medium', 'low'].map(priority => (
                    <div key={priority}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#666', textTransform: 'capitalize' }}>{priority}</span>
                        <span style={{ fontSize: '13px', color: '#999', fontFamily: 'monospace' }}>{priorityCount[priority] || 0}</span>
                      </div>
                      <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '2px' }}>
                        <div 
                          style={{
                            height: '100%', borderRadius: '2px',
                            background: priority === 'high' ? '#dc2626' : priority === 'medium' ? '#d97706' : '#22c55e',
                            width: `${Math.max((priorityCount[priority] || 0) / Math.max(response.tasks?.length || 1, 1) * 100, 2)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transcript */}
              <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '24px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Transcript</h2>
                <p style={{ fontSize: '12px', color: '#888', fontFamily: 'monospace', lineHeight: '1.7', maxHeight: '200px', overflowY: 'auto' }}>
                  {response.raw_transcript || 'No transcript available'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!response && !selectedFile && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: '64px', height: '64px', background: '#fafafa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>No audio file uploaded</p>
            <p style={{ fontSize: '13px', color: '#999' }}>Upload an audio file to extract action items</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analyzer;
