import { useState, useRef, useEffect } from 'react';
import { useMemoStore } from '../store/useMemoStore';
import { Plus, Pin, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { isJapanese } from '../utils/cjk';

interface SidebarProps {
  currentId: string | null;
  onSelect: (id: string | null) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

type LanguageFilter = 'ALL' | 'JP' | 'CN';

export function Sidebar({ currentId, onSelect, isOpen, onClose }: SidebarProps) {
  const { memoIds, createMemo, deleteMemo, getTitle, isPinned, getMemo, togglePin } = useMemoStore();
  const [isDeleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('ALL');
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  
  const longPressTimer = useRef<number | null>(null);
  const longPressId = useRef<string | null>(null);
  const easterEggTimer = useRef<number | null>(null);


  const handleCreate = () => {
    const newId = createMemo();
    onSelect(newId);
    if (onClose) onClose();
  };

  const toggleDeleteSelection = (id: string) => {
    const newSet = new Set(selectedForDelete);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedForDelete(newSet);
  };

  const handleDeleteSelected = () => {
    const count = selectedForDelete.size;
    const message = count === 1 
      ? 'Delete this memo?' 
      : `Delete ${count} memos?`;
    
    if (window.confirm(message)) {
      selectedForDelete.forEach(id => deleteMemo(id));
      setSelectedForDelete(new Set());
      setDeleteMode(false);
      if (currentId && selectedForDelete.has(currentId)) {
          onSelect(null);
      }
    }
  };

  // Detect language of memo
  const getMemoLanguage = (id: string): 'JP' | 'CN' | null => {
    const content = getMemo(id);
    if (!content || content.trim().length === 0) return null;
    return isJapanese(content) ? 'JP' : 'CN';
  };

  // Filter memos by language
  const filteredMemoIds = memoIds.filter(id => {
    if (languageFilter === 'ALL') return true;
    const lang = getMemoLanguage(id);
    return lang === languageFilter;
  });

  // Long press handlers
  const handleLongPressStart = (id: string, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    longPressId.current = id;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    
    longPressTimer.current = window.setTimeout(() => {
      setContextMenu({
        id,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePinFromMenu = (id: string) => {
    togglePin(id);
    setContextMenu(null);
  };

  const handleDeleteFromMenu = (id: string) => {
    if (window.confirm('Delete this memo?')) {
      deleteMemo(id);
      if (currentId === id) {
        onSelect(null);
      }
    }
    setContextMenu(null);
  };

  // Easter egg handler
  const handleEasterEggClick = () => {
    setEasterEggClicks(prev => prev + 1);
    
    if (easterEggTimer.current) {
      clearTimeout(easterEggTimer.current);
    }
    
    easterEggTimer.current = window.setTimeout(() => {
      setEasterEggClicks(0);
    }, 1000);
    
    if (easterEggClicks + 1 >= 3) {
      setShowEasterEgg(true);
      setEasterEggClicks(0);
      if (easterEggTimer.current) {
        clearTimeout(easterEggTimer.current);
      }
    }
  };

  // Close context menu on outside click
  useEffect(() => {
    if (contextMenu) {
      const handleClick = () => setContextMenu(null);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  return (
    <div className={cn(
      "flex flex-col h-full w-full sm:w-80 transition-all duration-300 backdrop-blur-2xl relative",
      isOpen === false ? "hidden sm:flex" : "flex"
    )}
    style={{ 
      background: 'linear-gradient(180deg, rgba(242, 242, 247, 0.85) 0%, rgba(242, 242, 247, 0.75) 100%)',
    }}>
      {/* Header - iOS Large Title Style with Glass Effect */}
      <div className="flex flex-col px-4 pt-6 pb-2 sticky top-0 z-10 backdrop-blur-xl"
           style={{ 
             background: 'linear-gradient(180deg, rgba(242, 242, 247, 0.95) 0%, rgba(242, 242, 247, 0.7) 100%)',
             borderBottom: '0.5px solid rgba(0, 0, 0, 0.05)'
           }}>
        <div className="flex items-center justify-between mb-3">
          <h1 
            className={cn(
              "text-[34px] font-bold tracking-tight cursor-pointer select-none"
            )}
            style={{ color: 'var(--ios-label)' }}
            onClick={() => {
              if (isDeleteMode) {
                setDeleteMode(false);
                setSelectedForDelete(new Set());
              } else {
                setDeleteMode(true);
              }
            }}
          >
            jibiji
          </h1>
          {!isDeleteMode && (
            <button 
              onClick={handleCreate}
              className="p-1.5 rounded-full transition-all active:scale-90 hover:bg-white/40"
              style={{ color: 'var(--ios-blue)' }}
              aria-label="New Memo"
            >
              <Plus size={28} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Language Filter */}
        {!isDeleteMode && (
          <div className="flex gap-2 mb-2">
            {(['ALL', 'JP', 'CN'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setLanguageFilter(filter)}
                className={cn(
                  "px-3 py-1 text-[13px] font-medium rounded-full transition-all",
                  languageFilter === filter
                    ? "bg-[var(--ios-blue)] text-white shadow-sm"
                    : "bg-white/60 text-[var(--ios-label)] hover:bg-white/80"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List - iOS Grouped Style with Glass Cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        <div className="rounded-2xl overflow-hidden shadow-sm" 
             style={{ 
               backgroundColor: 'rgba(255, 255, 255, 0.6)',
               backdropFilter: 'blur(20px)',
               border: '0.5px solid rgba(255, 255, 255, 0.8)'
             }}>
          {filteredMemoIds.length === 0 ? (
            <div className="p-8 text-center text-[15px]" style={{ color: 'var(--ios-tertiary-label)' }}>
              {languageFilter !== 'ALL' ? `No ${languageFilter} memos` : 'No memos'}
            </div>
          ) : (
            filteredMemoIds.map((id, index) => {
              const pinned = isPinned(id);
              const title = getTitle(id);
              const isSelected = currentId === id;
              const language = getMemoLanguage(id);
              
              return (
                <div key={id}>
                  <div 
                    className={cn(
                      "group flex items-center px-4 py-3 cursor-pointer transition-all select-none relative",
                      isSelected && !isDeleteMode && "bg-gradient-to-r from-blue-50/60 to-blue-100/40"
                    )}
                    onClick={() => {
                      if (isDeleteMode) {
                        toggleDeleteSelection(id);
                      } else {
                        onSelect(id);
                        if (onClose) onClose();
                      }
                    }}
                    onTouchStart={(e) => handleLongPressStart(id, e)}
                    onTouchEnd={handleLongPressEnd}
                    onMouseDown={(e) => handleLongPressStart(id, e)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                  >
                    {isDeleteMode ? (
                      <div className="mr-3 flex-shrink-0">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedForDelete.has(id) 
                            ? "border-[var(--ios-blue)] bg-[var(--ios-blue)] shadow-sm" 
                            : "border-[var(--ios-gray3)] bg-white/50"
                        )}>
                          {selectedForDelete.has(id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    ) : (
                        pinned && <Pin size={12} className="mr-2 flex-shrink-0" style={{ color: 'var(--ios-gray)' }} />
                    )}
                    
                    <span className={cn(
                      "flex-1 text-[17px] truncate",
                      isSelected ? "font-semibold" : "font-normal"
                    )}
                    style={{ color: isSelected ? 'var(--ios-label)' : 'var(--ios-label)' }}>
                      {title}
                    </span>

                    {/* Language Badge */}
                    {!isDeleteMode && language && (
                      <span className={cn(
                        "ml-2 px-2 py-0.5 text-[11px] font-semibold rounded-full flex-shrink-0",
                        language === 'JP' ? "bg-red-100/70 text-red-600" : "bg-yellow-100/70 text-yellow-700"
                      )}
                      style={{
                        backdropFilter: 'blur(10px)',
                        border: language === 'JP' ? '0.5px solid rgba(220, 38, 38, 0.2)' : '0.5px solid rgba(161, 98, 7, 0.2)'
                      }}>
                        {language}
                      </span>
                    )}

                    {/* iOS Chevron for selected item */}
                    {!isDeleteMode && isSelected && (
                      <svg className="w-3 h-3 ml-2 flex-shrink-0" style={{ color: 'var(--ios-gray2)' }} fill="currentColor" viewBox="0 0 8 13">
                        <path d="M0.5 0.5L6.5 6.5L0.5 12.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  
                  {/* iOS Style Separator with subtle shadow */}
                  {index < filteredMemoIds.length - 1 && (
                    <div className="h-[0.5px] ml-4" 
                         style={{ 
                           background: 'linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.06) 100%)'
                         }} />
                  )}
                </div>
              );
          }))}
        </div>
      </div>

      {/* Footer - Delete Mode Actions */}
      {isDeleteMode && (
        <div className="p-4 pt-2 pb-6 flex justify-center items-center safe-area-inset-bottom backdrop-blur-xl"
             style={{ 
               background: 'linear-gradient(0deg, rgba(242, 242, 247, 0.95) 0%, rgba(242, 242, 247, 0.7) 100%)',
               borderTop: '0.5px solid rgba(0, 0, 0, 0.05)'
             }}>
          <div className="flex gap-3 w-full justify-between px-2">
            <button 
              onClick={() => { setDeleteMode(false); setSelectedForDelete(new Set()); }}
              className="text-[17px] font-normal transition-opacity active:opacity-50"
              style={{ color: 'var(--ios-blue)' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteSelected}
              disabled={selectedForDelete.size === 0}
              className="text-[17px] font-semibold disabled:opacity-30 transition-opacity active:opacity-50"
              style={{ color: 'var(--ios-red)' }}
            >
              Delete ({selectedForDelete.size})
            </button>
          </div>
        </div>
      )}

      {/* Easter Egg Trigger - Bottom Left Corner */}
      <div 
        className="absolute bottom-0 left-0 w-16 h-16 cursor-default"
        onClick={handleEasterEggClick}
      />

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            transform: 'translate(-50%, -50%)',
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '0.5px solid rgba(0, 0, 0, 0.1)'
          }}
        >
          <button
            onClick={() => handlePinFromMenu(contextMenu.id)}
            className="flex items-center gap-3 px-5 py-3.5 w-full text-left hover:bg-gray-50 transition-colors"
          >
            <Pin size={20} style={{ color: 'var(--ios-label)' }} />
            <span className="text-[17px]" style={{ color: 'var(--ios-label)' }}>
              {isPinned(contextMenu.id) ? 'Unpin' : 'Pin'}
            </span>
          </button>
          <div className="h-[0.5px]" style={{ backgroundColor: 'var(--ios-separator)' }} />
          <button
            onClick={() => handleDeleteFromMenu(contextMenu.id)}
            className="flex items-center gap-3 px-5 py-3.5 w-full text-left hover:bg-gray-50 transition-colors"
          >
            <X size={20} style={{ color: 'var(--ios-red)' }} />
            <span className="text-[17px]" style={{ color: 'var(--ios-red)' }}>
              Delete
            </span>
          </button>
        </div>
      )}

      {/* Easter Egg Modal */}
      {showEasterEgg && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowEasterEgg(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
            style={{
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--ios-label)' }}>
              Developed by W00SE0K
            </h2>
            
            <p className="text-[15px] mb-4" style={{ color: 'var(--ios-secondary-label)' }}>
              Made with React · Vite · TypeScript
            </p>
            
            <p className="text-[13px] mb-6" style={{ color: 'var(--ios-tertiary-label)' }}>
              Version 1.0
            </p>

            <button
              onClick={() => setShowEasterEgg(false)}
              className="mt-6 px-6 py-2.5 rounded-xl text-[17px] font-semibold transition-all active:scale-95"
              style={{ 
                backgroundColor: 'var(--ios-blue)',
                color: '#FFFFFF'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
