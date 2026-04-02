import React, { useState } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setError(null);
    
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

  const getTimeAgo = () => {
    return 'just now';
  };

  const getTranscriptWordCount = () => {
    return response?.raw_transcript?.split(/\s+/).filter(Boolean).length || 0;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#f5f5f5]'} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Topbar */}
      <div className={`${darkMode ? 'border-[#1a1a1a]' : 'border-gray-200'} border-b`}>
        <div className="flex items-center gap-3 px-5 py-3">
          <div className={`w-6 h-6 rounded-lg ${darkMode ? 'bg-white' : 'bg-gray-900'} flex items-center justify-center flex-shrink-0`}>
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
              <path d="M3 6h6M6 3v6" stroke={darkMode ? '#000' : '#fff'} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Meeting Analyzer</span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-[#161616]' : 'hover:bg-gray-200'} transition-colors`}
            >
              {darkMode ? (
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`w-48 flex-shrink-0 ${darkMode ? 'border-[#141414]' : 'border-gray-200'} border-r p-4 hidden md:block`}>
          <div className="mb-5">
            <div className={`text-[10px] font-medium ${darkMode ? 'text-[#333]' : 'text-gray-400'} uppercase tracking-wider mb-2 px-2`}>Workspace</div>
            <div className={`${darkMode ? 'bg-[#161616] text-white' : 'bg-gray-100 text-gray-900'} flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer`}>
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="5" height="5" rx="1"/>
                <rect x="9" y="2" width="5" height="5" rx="1"/>
                <rect x="2" y="9" width="5" height="5" rx="1"/>
                <rect x="9" y="9" width="5" height="5" rx="1"/>
              </svg>
              Dashboard
            </div>
            {(response || selectedFile) && (
              <button
                onClick={() => {
                  setResponse(null);
                  setSelectedFile(null);
                  setError(null);
                }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer w-full ${darkMode ? 'text-[#555] hover:bg-[#161616]' : 'text-gray-500 hover:bg-gray-100'} transition-colors`}
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10"/>
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {response ? 'Analysis Results' : 'Dashboard'}
              </h1>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-[#444]' : 'text-gray-400'}`}>
                {response ? `${selectedFile?.name || 'audio'} · analyzed ${getTimeAgo()}` : 'Upload an audio file to analyze'}
              </p>
            </div>
            <label className="flex items-center gap-1.5 bg-[#EB0029] text-white rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer flex-shrink-0 hover:opacity-90 transition-opacity">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2v10M4 6l4-4 4 4M2 13h12"/>
              </svg>
              Upload audio
              <input type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
            <div className={`${darkMode ? 'bg-[#0f0f0f] border-[#1a1a1a]' : 'bg-white border-gray-200'} border rounded-xl p-3`}>
              <div className={`text-[10px] ${darkMode ? 'text-[#444]' : 'text-gray-400'} font-medium uppercase tracking-wide mb-2`}>Action items</div>
              <div className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{response?.tasks?.length || 0}</div>
              <div className={`text-[11px] mt-1 ${darkMode ? 'text-[#333]' : 'text-gray-300'}`}>from this meeting</div>
            </div>
            <div className={`${darkMode ? 'bg-[#0f0f0f] border-[#1a1a1a]' : 'bg-white border-gray-200'} border rounded-xl p-3`}>
              <div className={`text-[10px] ${darkMode ? 'text-[#444]' : 'text-gray-400'} font-medium uppercase tracking-wide mb-2`}>Language</div>
              <div className={`text-base font-semibold pt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{response?.language === 'en' ? 'English' : (response?.language || 'Auto')}</div>
              <div className={`text-[11px] mt-1 ${darkMode ? 'text-[#333]' : 'text-gray-300'}`}>auto-detected</div>
            </div>
            <div className={`${darkMode ? 'bg-[#0f0f0f] border-[#1a1a1a]' : 'bg-white border-gray-200'} border rounded-xl p-3`}>
              <div className={`text-[10px] ${darkMode ? 'text-[#444]' : 'text-gray-400'} font-medium uppercase tracking-wide mb-2`}>Duration</div>
              <div className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {response?.duration || '--'}
              </div>
              <div className={`text-[11px] mt-1 ${darkMode ? 'text-[#333]' : 'text-gray-300'}`}>{getTranscriptWordCount()} words</div>
            </div>
            <div className={`${darkMode ? 'bg-[#0f0f0f] border-[#1a1a1a]' : 'bg-white border-gray-200'} border rounded-xl p-3`}>
              <div className={`text-[10px] ${darkMode ? 'text-[#444]' : 'text-gray-400'} font-medium uppercase tracking-wide mb-2`}>Priority</div>
              <div className={`text-base font-semibold pt-0.5 ${priorityCount.high > 0 ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                {priorityCount.high > 0 ? `${priorityCount.high} urgent` : 'No urgent'}
              </div>
              <div className={`text-[11px] mt-1 ${darkMode ? 'text-[#333]' : 'text-gray-300'}`}>{priorityCount.medium + priorityCount.low} others</div>
            </div>
          </div>

          {/* File Bar */}
          {selectedFile && (
            <div className={`${darkMode ? 'bg-[#0f0f0f] border-[#1a1a1a]' : 'bg-white border-gray-200'} border rounded-xl p-3 flex items-center gap-3 mb-4`}>
              <div className={`w-8 h-8 rounded-lg ${darkMode ? 'bg-[#161616] border-[#222]' : 'bg-gray-100 border-gray-200'} border flex items-center justify-center flex-shrink-0`}>
                <svg className={`w-3.5 h-3.5 ${darkMode ? 'text-[#555]' : 'text-gray-400'}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"/>
                  <path d="M9 2v4h4"/>
                </svg>
              </div>
              <div>
                <div className={`text-xs font-medium ${darkMode ? 'text-[#ccc]' : 'text-gray-700'}`}>{selectedFile.name}</div>
                <div className={`text-[11px] ${darkMode ? 'text-[#333]' : 'text-gray-400'}`}>{formatFileSize(selectedFile.size)} · uploaded {getTimeAgo()}</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {isLoading ? (
                  <span className={`text-[11px] ${darkMode ? 'text-[#555]' : 'text-gray-400'}`}>Processing...</span>
                ) : response ? (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className={`text-[11px] ${darkMode ? 'text-[#555]' : 'text-gray-400'}`}>processed</span>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={`${darkMode ? 'bg-red-950/30 border-red-900/50' : 'bg-red-50 border-red-200'} border rounded-xl p-4 mb-4`}>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</span>
              </div>
            </div>
          )}

          {/* Analyze Button (when file selected but no response) */}
          {!response && selectedFile && !isLoading && (
            <div className="flex justify-center mb-4">
              <button
                onClick={handleUpload}
                className={`px-8 py-3 ${darkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'} rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity`}
              >
                Analyze Audio
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor: darkMode ? '#fff transparent transparent transparent' : '#000 transparent transparent transparent'}}></div>
              <p className={`mt-3 text-sm ${darkMode ? 'text-[#555]' : 'text-gray-400'}`}>Processing... (first request may take up to 60 seconds)</p>
            </div>
          )}

          {/* Results */}
          {response && !isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              {/* Left Column - Action Items & Summary */}
              <div className="lg:col-span-2 space-y-2">
                <div className={`${darkMode ? 'bg-[#0f0f0f] border-[#1a1a1a]' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
                  <div className={`text-[11px] font-medium ${darkMode ? 'text-[#444]' : 'text-gray-400'} uppercase tracking-wide mb-3`}>Action items</div>
                  <div className="space-y-2">
                    {response.tasks?.map((item, index) => (
                      <div key={index} className={`flex items-start gap-2 py-2 ${index < (response.tasks?.length || 0) - 1 ? (darkMode ? 'border-b border-[#141414]' : 'border-b border-gray-100') : ''}`}>
                        <span className={`text-[11px] ${darkMode ? 'text-[#2a2a2a]' : 'text-gray-300'} font-mono min-w-[22px]`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <p className={`text-xs ${darkMode ? 'text-[#888]' : 'text-gray-600'} leading-relaxed`}>
                            {item.assigned_to !== 'Unassigned' && <span className="font-medium">{item.assigned_to} — </span>}
                            {item.task}
                            {item.deadline && item.deadline !== 'Not specified' && <span className={`${darkMode ? 'text-[#555]' : 'text-gray-400'}`}> · {item.deadline}</span>}
                          </p>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border flex-shrink-0 ${
                          item.priority === 'high' 
                            ? (darkMode ? 'bg-red-950/50 text-red-500 border-red-900/50' : 'bg-red-50 text-red-600 border-red-200')
                            : (darkMode ? 'bg-[#111] text-[#444] border-[#1a1a1a]' : 'bg-gray-100 text-gray-500 border-gray-200')
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                    ))}
                    {(!response.tasks || response.tasks.length === 0) && (
                      <p className={`text-xs ${darkMode ? 'text-[#555]' : 'text-gray-400'}`}>No action items detected</p>
                    )}
                  </div>
                </div>

                  <div className={`${darkMode ? 'bg-[#0f0f0f] border-[#1a1a1a]' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
                  <div className={`text-[11px] font-medium ${darkMode ? 'text-[#444]' : 'text-gray-400'} uppercase tracking-wide mb-3`}>Summary</div>
                  <p className={`text-xs ${darkMode ? 'text-[#555]' : 'text-gray-500'} leading-relaxed`}>
                    {response.summary || response.raw_transcript?.slice(0, 300) || 'No summary available'}
                  </p>
                </div>
              </div>

              {/* Right Column - Priority & Transcript */}
              <div className="space-y-2">
                <div className={`${darkMode ? 'bg-[#0f0f0f] border-[#1a1a1a]' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
                  <div className={`text-[11px] font-medium ${darkMode ? 'text-[#444]' : 'text-gray-400'} uppercase tracking-wide mb-3`}>Priority breakdown</div>
                  <div className="space-y-3">
                    {['high', 'medium', 'low'].map(priority => (
                      <div key={priority}>
                        <div className="flex justify-between mb-1">
                          <span className={`text-[11px] ${darkMode ? 'text-[#333]' : 'text-gray-400'}`}>{priority}</span>
                          <span className={`text-[11px] font-mono ${darkMode ? 'text-[#333]' : 'text-gray-400'}`}>{priorityCount[priority] || 0}</span>
                        </div>
                        <div className={`h-0.5 rounded-full ${darkMode ? 'bg-[#161616]' : 'bg-gray-100'}`}>
                          <div 
                            className={`h-full rounded-full ${
                              priority === 'high' ? 'bg-red-500' 
                                : priority === 'medium' ? (darkMode ? 'bg-[#333]' : 'bg-gray-400')
                                : (darkMode ? 'bg-[#222]' : 'bg-gray-300')
                            }`}
                            style={{width: `${Math.max((priorityCount[priority] || 0) / Math.max(response.tasks?.length || 1, 1) * 100, 2)}%`}}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-[#0f0f0f] border-[#1a1a1a]' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
                  <div className={`text-[11px] font-medium ${darkMode ? 'text-[#444]' : 'text-gray-400'} uppercase tracking-wide mb-2`}>Transcript</div>
                  <p className={`text-[11px] ${darkMode ? 'text-[#2a2a2a]' : 'text-gray-300'} font-mono leading-relaxed max-h-32 overflow-y-auto`}>
                    {response.raw_transcript || 'No transcript available'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!response && !selectedFile && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className={`w-12 h-12 rounded-full ${darkMode ? 'bg-[#161616]' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <svg className={`w-6 h-6 ${darkMode ? 'text-[#333]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className={`text-sm ${darkMode ? 'text-[#555]' : 'text-gray-400'} mb-2`}>No audio file uploaded</p>
              <p className={`text-xs ${darkMode ? 'text-[#333]' : 'text-gray-400'}`}>Upload an audio file to extract action items</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
