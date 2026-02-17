// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, X, RotateCcw, Globe, Layout, Monitor, 
  Maximize2, Minimize2 
} from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatUrl = (input) => {
  if (!input) return '';
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
};

const WebviewFrame = ({ windowData, updateWindow, removeWindow, toggleMaximize, isMaximized, isActive, onActivate }) => {
  const [inputUrl, setInputUrl] = useState(windowData.url);
  const [isLoading, setIsLoading] = useState(false);
  const webviewRef = useRef(null);

  useEffect(() => {
    setInputUrl(windowData.url);
  }, [windowData.url]);

  // Handle focus and native loading events
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const startLoad = () => setIsLoading(true);
    const stopLoad = () => setIsLoading(false);
    const handleFocus = () => onActivate(); 
    
    webview.addEventListener('did-start-loading', startLoad);
    webview.addEventListener('did-stop-loading', stopLoad);
    webview.addEventListener('focus', handleFocus); 

    return () => {
      webview.removeEventListener('did-start-loading', startLoad);
      webview.removeEventListener('did-stop-loading', stopLoad);
      webview.removeEventListener('focus', handleFocus);
    };
  }, [onActivate]);

  // Apply zoom levels when they change via state
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;
    
    const applyZoom = () => {
      if (windowData.zoomLevel !== undefined) {
        webview.setZoomLevel(windowData.zoomLevel);
      }
    };

    try { applyZoom(); } catch (e) { }
    webview.addEventListener('dom-ready', applyZoom);
    
    return () => webview.removeEventListener('dom-ready', applyZoom);
  }, [windowData.zoomLevel]);

  const handleNavigate = (e) => {
    e.preventDefault();
    const formatted = formatUrl(inputUrl);
    updateWindow(windowData.id, { url: formatted });
  };

  const handleRefresh = () => {
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  return (
    <div 
      onClickCapture={onActivate} 
      className={`
        flex flex-col bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300
        ${isActive ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border border-slate-200'}
        ${isMaximized ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[500px]'}
    `}>
      <div className={`flex items-center gap-2 p-2 border-b ${isActive ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-100 border-slate-200'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); removeWindow(windowData.id); }}
          className="p-1.5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
        >
          <X size={14} />
        </button>

        <form onSubmit={handleNavigate} className="flex-1 flex gap-2">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-slate-400">
              <Globe size={14} />
            </div>
            <input 
              type="text" 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter website URL..."
            />
          </div>
          <button 
            type="button" 
            onClick={handleRefresh}
            className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded"
          >
            <RotateCcw size={16} />
          </button>
        </form>

        <button 
          onClick={() => toggleMaximize(windowData.id)}
          className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded"
        >
          {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      <div className="flex-1 relative bg-slate-50">
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 z-10">
             <div className="h-full bg-blue-500 animate-pulse"></div>
          </div>
        )}
        
        {!windowData.url ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8">
            <Monitor size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Ready to Browse</h3>
          </div>
        ) : (
          <webview
            ref={webviewRef}
            src={windowData.url}
            className="w-full h-full border-0"
            allowpopups="true"
            useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
          ></webview>
        )}
      </div>
    </div>
  );
};

// CRITICAL: Ensure 'export default' is right here!
export default function App() {
  const loadState = () => {
    try {
      const saved = localStorage.getItem('electronGridState');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return {
      windows: [
        { id: '1', url: 'https://xtremezero.net/Grid-Browser', title: 'Grid Browser', zoomLevel: 0 },
        { id: '2', url: 'https://github.com/xtremezero/Grid-Browser', title: 'Github', zoomLevel: 0 }
      ],
      columns: 2,
      activeId: '1'
    };
  };

  const [state, setState] = useState(loadState);
  const [maximizedId, setMaximizedId] = useState(null);

  useEffect(() => {
    localStorage.setItem('electronGridState', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!window.require) return;
    const { ipcRenderer } = window.require('electron');

    const handleZoom = (delta) => {
      setState(prev => {
        if (!prev.activeId) return prev;
        return {
          ...prev,
          windows: prev.windows.map(w => {
            if (w.id === prev.activeId) {
              const newZoom = delta === 0 ? 0 : (w.zoomLevel || 0) + delta;
              return { ...w, zoomLevel: newZoom };
            }
            return w;
          })
        };
      });
    };

    const zoomIn = () => handleZoom(0.5);
    const zoomOut = () => handleZoom(-0.5);
    const zoomReset = () => handleZoom(0);

    ipcRenderer.on('zoom-in', zoomIn);
    ipcRenderer.on('zoom-out', zoomOut);
    ipcRenderer.on('zoom-reset', zoomReset);

    return () => {
      ipcRenderer.removeListener('zoom-in', zoomIn);
      ipcRenderer.removeListener('zoom-out', zoomOut);
      ipcRenderer.removeListener('zoom-reset', zoomReset);
    };
  }, []);

  const updateWindow = (id, data) => {
    setState(prev => ({
      ...prev,
      windows: prev.windows.map(w => w.id === id ? { ...w, ...data } : w)
    }));
  };

  const addWindow = () => {
    const newId = generateId();
    setState(prev => ({
      ...prev,
      windows: [...prev.windows, { id: newId, url: '', zoomLevel: 0 }],
      activeId: newId
    }));
  };

  const removeWindow = (id) => setState(prev => {
    const nextWindows = prev.windows.filter(w => w.id !== id);
    return {
      ...prev, 
      windows: nextWindows,
      activeId: prev.activeId === id ? (nextWindows[0]?.id || null) : prev.activeId 
    };
  });

  const getGridClass = () => {
    switch (state.columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default: return 'grid-cols-2';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Layout size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Grid Browser</h1>
        </div>

        <div className="flex items-center gap-4 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => setState(p => ({ ...p, columns: num }))}
              className={`w-8 h-8 rounded flex items-center justify-center font-medium transition-all ${
                state.columns === num 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={addWindow} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Plus size={16} /> New Tab
          </button>
        </div>
      </header>

      <main className={`flex-1 p-6 grid gap-6 ${getGridClass()}`}>
        {state.windows.map(w => (
          <WebviewFrame 
            key={w.id} 
            windowData={w} 
            updateWindow={updateWindow}
            removeWindow={removeWindow}
            toggleMaximize={(id) => setMaximizedId(maximizedId === id ? null : id)}
            isMaximized={maximizedId === w.id}
            isActive={state.activeId === w.id}
            onActivate={() => setState(prev => ({ ...prev, activeId: w.id }))}
          />
        ))}
      </main>
    </div>
  );
}
