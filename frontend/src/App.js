import React, { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setResponse(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    try {
      const res = await fetch(`${API_URL}/api/upload-audio`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResponse(data);
      } else if (res.ok && data.error) {
        setError(data.message || data.error);
      } else {
        setError(data.message || `Server error (${res.status})`);
      }
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError('Failed to connect to server: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-text-primary">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Meeting Analyzer</h1>
          <p className="text-text-secondary text-sm">Extract action items from your meeting recordings</p>
        </header>

        <main className="space-y-6">
          <div className="bg-surface-secondary border border-border-subtle rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="px-4 py-3 bg-surface-tertiary border border-border-subtle rounded-xl hover:border-border-default transition-colors text-left">
                  <span className="text-text-secondary text-sm">
                    {selectedFile ? selectedFile.name : 'Choose audio file'}
                  </span>
                </div>
              </label>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className="px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing
                  </span>
                ) : (
                  'Analyze'
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-surface-secondary border border-red-900/30 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-red-400 font-medium text-sm">Error</h3>
                  <p className="text-text-secondary text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {response && (
            <div className="space-y-4">
              <div className="bg-surface-secondary border border-border-subtle rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-sm font-medium text-text-secondary">Summary</h2>
                </div>
                <p className="text-text-primary leading-relaxed">{response.summary?.text || 'No summary available'}</p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle">
                  <span className="text-xs text-text-tertiary">
                    {response.action_items?.length || 0} action items
                  </span>
                  <span className="text-xs text-text-tertiary uppercase">
                    {response.language || 'en'}
                  </span>
                </div>
              </div>

              {response.action_items && response.action_items.length > 0 && (
                <div className="bg-surface-secondary border border-border-subtle rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <h2 className="text-sm font-medium text-text-secondary">Action Items</h2>
                  </div>
                  <div className="space-y-3">
                    {response.action_items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-surface-tertiary rounded-xl p-4 border-l-2 border-text-tertiary"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-text-tertiary font-mono">{String(index + 1).padStart(2, '0')}</span>
                            <span className="text-text-primary text-sm font-medium">{item.task}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                            item.priority === 'high' 
                              ? 'bg-red-500/10 text-red-400' 
                              : item.priority === 'low'
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-text-tertiary">
                          <span>{item.assigned_to}</span>
                          <span>Due: {item.deadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-surface-secondary border border-border-subtle rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <h2 className="text-sm font-medium text-text-secondary">Transcript</h2>
                </div>
                <p className="text-text-tertiary text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {response.transcript || 'No transcript available'}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
