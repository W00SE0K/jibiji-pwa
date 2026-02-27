import { useState, useRef, useCallback } from 'react';
import { useMemoStore } from './store/useMemoStore';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Menu, Share, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { cn } from './utils/cn';

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('view');
  const [showPinyin, setShowPinyin] = useState(true);
  
  const { getMemo, getTitle, updateContent, updateTitle, customTitles } = useMemoStore();

  const currentContent = selectedId ? getMemo(selectedId) : '';
  const currentTitle = selectedId ? getTitle(selectedId) : '';
  const currentCustomTitle = selectedId ? (customTitles[selectedId] || '') : '';

  // Swipe gesture state
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const handleSelect = (id: string | null) => {
    setSelectedId(id);
    if (id) {
        // On mobile, close sidebar automatically
        if (window.innerWidth < 640) setShowSidebar(false);
    }
  };

  const handleBackToSidebar = useCallback(() => {
    setShowSidebar(true);
    setSelectedId(null); // Deselect memo when going back
    setViewMode('view'); // Reset to view mode
  }, []);

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    
    // Swipe right detection (at least 100px, and more horizontal than vertical)
    if (deltaX > 100 && Math.abs(deltaY) < Math.abs(deltaX) / 2) {
      // Only on mobile and when sidebar is hidden
      if (window.innerWidth < 640 && !showSidebar && selectedId) {
        handleBackToSidebar();
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-root flex h-screen w-full overflow-hidden font-sans"
         style={{ 
           backgroundColor: 'var(--ios-secondary-background)',
           color: 'var(--ios-label)' 
         }}>
        {/* Sidebar container */}
        <div className={cn(
             "absolute z-20 h-full w-full sm:static sm:w-80 transition-all duration-300 transform no-print",
             showSidebar ? "translate-x-0" : "-translate-x-full sm:w-0 sm:overflow-hidden"
        )}
        style={{ borderRight: showSidebar ? '0.5px solid var(--ios-separator)' : 'none' }}>
             <div className="w-full h-full sm:w-80">
                <Sidebar currentId={selectedId} onSelect={handleSelect} />
             </div>
        </div>

        {/* Main Content with swipe gesture */}
        <div 
          className="flex-1 flex flex-col h-full w-full relative print-content"
          style={{ 
            backgroundColor: 'var(--ios-background)',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
            {/* Header (iOS Navigation Bar) with Glass Effect */}
            <div className="flex items-center justify-between px-4 py-2 z-10 no-print"
                 style={{ 
                   borderBottom: '0.5px solid var(--ios-separator)',
                   backgroundColor: 'var(--ios-background)',
                 }}>
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <button 
                      onClick={handleBackToSidebar} 
                      className="p-1 -ml-2 rounded-md transition-all active:opacity-50 hover:bg-white/40"
                      style={{ color: 'var(--ios-blue)' }}
                      aria-label="Back to Sidebar"
                    >
                        {showSidebar ? <ChevronLeft size={28} strokeWidth={2} /> : <Menu size={28} strokeWidth={2} />}
                    </button>
                    
                    {/* Title Input or Display */}
                    {selectedId && (
                       <input 
                         type="text" 
                         value={currentCustomTitle}
                         placeholder={currentTitle === 'Untitled' ? 'Untitled' : currentTitle}
                         onChange={(e) => updateTitle(selectedId, e.target.value)}
                         className="text-[17px] font-semibold bg-transparent outline-none w-full"
                         style={{ 
                           color: 'var(--ios-label)',
                           caretColor: 'var(--ios-blue)'
                         }}
                       />
                    )}
                </div>

                {selectedId && (
                   <div className="flex gap-1 items-center">
                       {viewMode === 'view' && (
                           <button
                             onClick={() => setShowPinyin(!showPinyin)}
                             className="p-2 rounded-md transition-all active:opacity-50 hover:bg-white/40"
                             style={{ color: 'var(--ios-blue)' }}
                             aria-label={showPinyin ? 'Hide Pinyin' : 'Show Pinyin'}
                             title={showPinyin ? 'Hide Pinyin' : 'Show Pinyin'}
                           >
                             {showPinyin ? <Eye size={22} strokeWidth={2} /> : <EyeOff size={22} strokeWidth={2} />}
                           </button>
                       )}

                       <button 
                         onClick={handlePrint}
                         className="p-2 rounded-md transition-all active:opacity-50 hover:bg-white/40"
                         style={{ color: 'var(--ios-blue)' }}
                         title="Export PDF"
                         aria-label="Export PDF"
                        >
                           <Share size={22} strokeWidth={2} />
                       </button>
                       
                       <button 
                         onClick={() => setViewMode(viewMode === 'edit' ? 'view' : 'edit')}
                         className="ml-2 px-4 py-1.5 rounded-lg text-[17px] font-semibold transition-all active:opacity-90 hover:shadow-md"
                         style={{ 
                           backgroundColor: 'var(--ios-blue)',
                           color: '#FFFFFF'
                         }}
                       >
                         {viewMode === 'edit' ? 'Done' : 'Edit'}
                       </button>
                   </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto relative print-content"
                 style={{ backgroundColor: 'var(--ios-background)' }}>
                {selectedId ? (
                    viewMode === 'edit' ? (
                       <Editor 
                         content={currentContent} 
                         onChange={(val) => updateContent(selectedId, val)} 
                       />
                    ) : (
                       <div 
                         onClick={() => {
                           // Click anywhere in preview to start editing if empty
                           if (!currentContent || currentContent.trim().length === 0) {
                             setViewMode('edit');
                           }
                         }}
                         className={cn(
                           !currentContent || currentContent.trim().length === 0 ? "cursor-pointer" : ""
                         )}
                       >
                         <Preview content={currentContent} showPinyin={showPinyin} />
                       </div>
                    )
                ) : (
                    <div 
                      className="flex flex-col items-center justify-center h-full no-print cursor-default"
                      style={{ color: 'var(--ios-tertiary-label)' }}
                    >
                        <p className="text-[17px]">No memo selected</p>
                        <p className="text-[13px] mt-2 opacity-60">Create or select a memo to get started</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}

export default App;
